import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInspection = useCallback(async () => {
    try {
      const res = await api.get(`/inspections/${id}`);
      setInspection(res.data);
      setChecklists(res.data.checklists || []);
      if (res.data.status === 'ASSIGNED') setStep(1);
      else if (res.data.status === 'IN_PROGRESS') setStep(3);
      else if (res.data.status === 'COMPLETED') setStep(6);
    } catch (error) {
      console.error('Error fetching inspection:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInspection();
  }, [fetchInspection]);

  const startInspection = async () => {
    try {
      await api.put(`/inspections/${id}/status`, { status: 'IN_PROGRESS' });
      setStep(2);
      fetchInspection();
    } catch (error) {
      console.error('Error starting inspection:', error);
    }
  };

  const verifyGPS = async () => {
    setGpsLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const res = await api.post(`/inspections/${id}/verify-gps`, { latitude, longitude });
          setGpsStatus(res.data);
          setGpsLoading(false);
          if (res.data.verified) {
            setTimeout(() => setStep(3), 1500);
          }
        },
        (error) => {
          setGpsStatus({ verified: false, message: 'Unable to get location. Please enable GPS.' });
          setGpsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } catch (error) {
      setGpsLoading(false);
    }
  };

  const toggleChecklist = (index, status) => {
    const updated = [...checklists];
    updated[index].status = updated[index].status === 'PASS' ? 'PENDING' : status;
    setChecklists(updated);
  };

  const submitChecklist = async () => {
    try {
      const payload = checklists.map(c => ({
        id: c.id,
        status: c.status,
        remarks: c.remarks
      }));
      await api.put(`/inspections/${id}/checklist`, { checklists: payload });
      setStep(4);
    } catch (error) {
      console.error('Error submitting checklist:', error);
    }
  };

  const uploadEvidence = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', inspection?.inspectorLatitude || '');
    formData.append('longitude', inspection?.inspectorLongitude || '');
    try {
      const res = await api.post(`/evidence/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEvidenceList([...evidenceList, res.data]);
    } catch (error) {
      console.error('Error uploading evidence:', error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadEvidence(file));
  };

  const submitInspection = async () => {
    setSubmitting(true);
    try {
      await api.post(`/inspections/${id}/complete`, { overallRemarks: remarks });
      setStep(6);
      fetchInspection();
    } catch (error) {
      console.error('Error submitting inspection:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const passedCount = checklists.filter(c => c.status === 'PASS').length;
  const totalApplicable = checklists.filter(c => c.status !== 'NA').length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  if (!inspection) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-purple-200">Inspection not found</p>
        </div>
      </Layout>
    );
  }

  const steps = [
    { num: 1, label: 'Start' },
    { num: 2, label: 'GPS Verify' },
    { num: 3, label: 'Checklist' },
    { num: 4, label: 'Evidence' },
    { num: 5, label: 'Submit' },
    { num: 6, label: 'Complete' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <button onClick={() => navigate('/inspector/dashboard')} className="text-purple-300 hover:text-white font-mono text-xs font-bold inline-flex items-center">
          ← Back to My Inspections
        </button>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold text-white">{inspection.inspectionId}</h1>
              <p className="text-purple-200 font-semibold mt-1">{inspection.project?.name}</p>
              <p className="text-xs text-purple-300 font-mono mt-1">{inspection.project?.location}</p>
            </div>
            <div className="text-right">
              <span className={`badge ${
                inspection.priority === 'HIGH' || inspection.priority === 'URGENT' ? 'badge-danger' :
                inspection.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'
              }`}>{inspection.priority}</span>
              {inspection.type === 'SURPRISE' && <span className="badge badge-danger ml-2">Surprise</span>}
              <p className="text-xs font-mono text-purple-200 mt-2">Status: {inspection.status?.replace('_', ' ')}</p>
              {inspection.complianceScore && (
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">Compliance: {inspection.complianceScore}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-purple-300' : 'text-purple-500/40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono ${
                    step >= s.num ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'bg-purple-950/60 text-purple-400/50 border border-purple-800/40'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider hidden md:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-purple-600' : 'bg-purple-950'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="card text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-purple-600/30 border border-purple-400/30 rounded-2xl flex items-center justify-center mx-auto text-purple-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Ready to Start Inspection?</h3>
            <p className="text-purple-200 text-sm">Target Project: {inspection.project?.name}</p>
            <button onClick={startInspection} className="btn-primary text-base px-8 py-3">
              Start Inspection Session
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-600/30 border border-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">GPS Geofence Location Verification</h3>
            <p className="text-purple-200 text-sm">Verify that you are physically present at the site</p>
            <p className="text-xs font-mono text-purple-300">
              Expected Location: {inspection.project?.latitude}, {inspection.project?.longitude}
            </p>

            {gpsStatus ? (
              <div className={`max-w-md mx-auto p-4 rounded-xl border ${gpsStatus.verified ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-rose-950/40 border-rose-800/50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gpsStatus.verified ? '✅' : '❌'}</span>
                  <div className="text-left">
                    <p className={`font-bold font-mono text-sm ${gpsStatus.verified ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {gpsStatus.verified ? 'GEOFENCE VERIFIED' : 'NOT VERIFIED'}
                    </p>
                    {gpsStatus.distance !== undefined && (
                      <p className="text-xs font-mono text-purple-200">Distance: {gpsStatus.distance}m</p>
                    )}
                    <p className="text-xs text-purple-200 mt-1">{gpsStatus.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={verifyGPS} disabled={gpsLoading} className="btn-primary text-base px-8 py-3">
                {gpsLoading ? 'Acquiring GPS Data...' : 'Verify Geofence Location'}
              </button>
            )}

            {gpsStatus && !gpsStatus.verified && (
              <button onClick={() => setStep(3)} className="btn-secondary mt-4 text-xs font-mono">
                Bypass GPS (Override Logged)
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white">Inspection Checklist</h3>
            <div className="p-4 bg-[#141024] rounded-xl border border-purple-800/40">
              <p className="text-xs font-mono text-purple-200">
                Checklist Progress: <span className="font-bold text-white">{passedCount}/{totalApplicable}</span> passed
                {totalApplicable > 0 && (
                  <span className="ml-2 text-emerald-400">({Math.round((passedCount/totalApplicable)*100)}%)</span>
                )}
              </p>
              <div className="w-full bg-purple-950 rounded-full h-2 mt-2 border border-purple-800/40">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all"
                  style={{ width: `${totalApplicable > 0 ? (passedCount/totalApplicable)*100 : 0}%` }}
                />
              </div>
            </div>

            {Object.entries(
              checklists.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wider border-b border-purple-800/40 pb-1">{category}</h4>
                <div className="space-y-2">
                  {items.map((item) => {
                    const globalIdx = checklists.indexOf(item);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#141024] border border-purple-800/40">
                        <button
                          onClick={() => toggleChecklist(globalIdx, 'PASS')}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            item.status === 'PASS' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-purple-600/50 bg-purple-950/40'
                          }`}
                        >
                          {item.status === 'PASS' && '✓'}
                        </button>
                        <span className="text-sm font-semibold text-white flex-1">{item.item}</span>
                        <span className={`badge ${
                          item.status === 'PASS' ? 'badge-success' :
                          item.status === 'FAIL' ? 'badge-danger' :
                          item.status === 'NA' ? 'badge-gray' : 'badge-warning'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={submitChecklist} className="btn-primary mt-4">
              Submit Checklist Data
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white">Geotagged Evidence Upload</h3>
            <div className="border-2 border-dashed border-purple-700/50 rounded-2xl p-8 text-center bg-[#141024]">
              <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-purple-200 mb-2">Upload on-site evidence photos or documents</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                Select Evidence Files
              </button>
            </div>

            {evidenceList.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold text-purple-300 uppercase">Uploaded Files ({evidenceList.length})</h4>
                {evidenceList.map((ev, idx) => (
                  <div key={ev.id || idx} className="flex items-center gap-3 p-3.5 bg-[#141024] border border-purple-800/40 rounded-xl">
                    <span className="text-xl">{ev.type === 'IMAGE' ? '📷' : '📄'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{ev.fileName}</p>
                      <p className="text-xs font-mono text-purple-300">{ev.type} • {new Date(ev.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="badge badge-success">Uploaded</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(5)} className="btn-primary flex-1">
                Continue to Remarks
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="card space-y-4">
            <h3 className="text-lg font-bold text-white">Remarks & Final Submission</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Overall Observations & Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input"
                  rows="4"
                  placeholder="Enter detailed field remarks, discrepancies found, and recommendations..."
                />
              </div>

              <button onClick={submitInspection} disabled={submitting} className="btn-success w-full py-3.5 text-base font-bold">
                {submitting ? 'Submitting Report...' : 'Submit Complete Inspection'}
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="card text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-600/30 border border-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Inspection Completed!</h3>
            <p className="text-purple-200 font-mono text-sm">Inspection ID: {inspection.inspectionId}</p>
            {inspection.complianceScore && (
              <p className="text-lg font-bold text-emerald-400 font-mono">
                Compliance Score: {inspection.complianceScore}%
              </p>
            )}
            <button onClick={() => navigate('/inspector/dashboard')} className="btn-primary mt-4">
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InspectionDetail;
