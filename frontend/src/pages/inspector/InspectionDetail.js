import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import axios from 'axios';

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
      const res = await axios.get(`http://localhost:5000/api/inspections/${id}`);
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
      await axios.put(`http://localhost:5000/api/inspections/${id}/status`, { status: 'IN_PROGRESS' });
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
          const res = await axios.post(`http://localhost:5000/api/inspections/${id}/verify-gps`, { latitude, longitude });
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
      await axios.put(`http://localhost:5000/api/inspections/${id}/checklist`, { checklists: payload });
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
      const res = await axios.post(`http://localhost:5000/api/evidence/${id}`, formData, {
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
      await axios.post(`http://localhost:5000/api/inspections/${id}/complete`, { overallRemarks: remarks });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!inspection) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Inspection not found</p>
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
        <button onClick={() => navigate('/inspector/dashboard')} className="text-blue-600 hover:underline inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inspections
        </button>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{inspection.inspectionId}</h1>
              <p className="text-gray-600">{inspection.project?.name}</p>
              <p className="text-sm text-gray-500">{inspection.project?.location}</p>
            </div>
            <div className="text-right">
              <span className={`badge ${
                inspection.priority === 'HIGH' || inspection.priority === 'URGENT' ? 'badge-danger' :
                inspection.priority === 'MEDIUM' ? 'badge-warning' : 'badge-gray'
              }`}>{inspection.priority}</span>
              {inspection.type === 'SURPRISE' && <span className="badge badge-danger ml-2">Surprise</span>}
              <p className="text-sm text-gray-500 mt-2">Status: {inspection.status?.replace('_', ' ')}</p>
              {inspection.complianceScore && (
                <p className="text-sm font-medium mt-1">Compliance: {inspection.complianceScore}%</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className="text-sm font-medium hidden md:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start Inspection?</h3>
            <p className="text-gray-500 mb-6">Project: {inspection.project?.name}</p>
            <button onClick={startInspection} className="btn-primary text-lg px-8 py-3">
              Start Inspection
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">GPS Location Verification</h3>
            <p className="text-gray-500 mb-2">Verify that you are at the project location</p>
            <p className="text-sm text-gray-400 mb-6">
              Expected: {inspection.project?.latitude}, {inspection.project?.longitude}
            </p>

            {gpsStatus ? (
              <div className={`max-w-md mx-auto p-4 rounded-lg ${gpsStatus.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${gpsStatus.verified ? '✓' : '✗'}`}>
                    {gpsStatus.verified ? '✅' : '❌'}
                  </span>
                  <div className="text-left">
                    <p className={`font-semibold ${gpsStatus.verified ? 'text-green-700' : 'text-red-700'}`}>
                      {gpsStatus.verified ? 'VERIFIED' : 'NOT VERIFIED'}
                    </p>
                    {gpsStatus.distance !== undefined && (
                      <p className="text-sm text-gray-600">Distance: {gpsStatus.distance}m</p>
                    )}
                    <p className="text-sm text-gray-500">{gpsStatus.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={verifyGPS} disabled={gpsLoading} className="btn-primary text-lg px-8 py-3">
                {gpsLoading ? 'Verifying...' : 'Verify My Location'}
              </button>
            )}

            {gpsStatus && !gpsStatus.verified && (
              <button onClick={() => setStep(3)} className="btn-secondary mt-4 text-sm">
                Skip (Not Recommended)
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Inspection Checklist</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Progress: <span className="font-semibold">{passedCount}/{totalApplicable}</span> checks passed
                {totalApplicable > 0 && (
                  <span className="ml-2">({Math.round((passedCount/totalApplicable)*100)}%)</span>
                )}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
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
              <div key={category} className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3 pb-2 border-b">{category}</h4>
                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const globalIdx = checklists.indexOf(item);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <button
                          onClick={() => toggleChecklist(globalIdx, 'PASS')}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.status === 'PASS' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          {item.status === 'PASS' && '✓'}
                        </button>
                        <span className="text-sm flex-1">{item.item}</span>
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
              Submit Checklist
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Evidence Upload</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-2">Upload photos, documents, or videos</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                Select Files
              </button>
            </div>

            {evidenceList.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Uploaded Evidence</h4>
                {evidenceList.map((ev, idx) => (
                  <div key={ev.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">
                      {ev.type === 'IMAGE' ? '📷' : ev.type === 'VIDEO' ? '🎥' : '📄'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ev.fileName}</p>
                      <p className="text-xs text-gray-500">{ev.type} • {new Date(ev.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="badge badge-success">Uploaded</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(5)} className="btn-primary">
                Continue to Remarks
              </button>
              <button onClick={() => setStep(5)} className="btn-secondary">
                Skip Evidence
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Remarks & Submission</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Overall Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input"
                  rows="5"
                  placeholder="Enter your observations, issues found, and recommendations..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Inspection Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">GPS Verified</p>
                    <p className={`font-medium ${gpsStatus?.verified ? 'text-green-600' : 'text-red-600'}`}>
                      {gpsStatus?.verified ? 'Yes' : inspection.gpsVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Checklist</p>
                    <p className="font-medium">{passedCount}/{totalApplicable} passed</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Evidence Uploaded</p>
                    <p className="font-medium">{evidenceList.length} files</p>
                  </div>
                </div>
              </div>

              <button onClick={submitInspection} disabled={submitting} className="btn-success w-full py-3 text-lg">
                {submitting ? 'Submitting...' : 'Submit Inspection'}
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Inspection Completed!</h3>
            <p className="text-gray-500 mb-2">Inspection ID: {inspection.inspectionId}</p>
            {inspection.complianceScore && (
              <p className="text-lg font-semibold mb-6">
                Compliance Score: <span className="text-blue-600">{inspection.complianceScore}%</span>
              </p>
            )}
            <button onClick={() => navigate('/inspector/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InspectionDetail;
