import React, { useState } from 'react';
import api from '../services/api';

const SurveillanceModal = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState('cctv'); // 'cctv' or 'vc'
  const [selectedCam, setSelectedCam] = useState('CAM-01');
  const [vcRole, setVcRole] = useState('Project Incharge');
  const [vcActive, setVcActive] = useState(false);
  const [vcRoom, setVcRoom] = useState(null);
  const [loadingVc, setLoadingVc] = useState(false);

  const cameras = [
    { id: 'CAM-01', name: 'Main Entrance Gate', status: 'ONLINE', fps: 30, resolution: '1080p', color: 'from-[#2e1065] to-[#4c1d95]' },
    { id: 'CAM-02', name: 'Sanitation & Health Block', status: 'ONLINE', fps: 28, resolution: '1080p', color: 'from-[#3b0764] to-[#581c87]' },
    { id: 'CAM-03', name: 'Classroom / Activity Hall', status: 'OFFLINE', fps: 0, resolution: 'N/A', color: 'from-slate-900 to-slate-800' },
    { id: 'CAM-04', name: 'Dining & Kitchen Area', status: 'ONLINE', fps: 30, resolution: '720p', color: 'from-[#1e1b4b] to-[#312e81]' },
  ];

  const handleStartVc = async () => {
    setLoadingVc(true);
    try {
      const res = await api.post('/surveillance/vc/initiate', {
        projectId: project?.id,
        targetRole: vcRole
      });
      setVcRoom(res.data);
      setVcActive(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVc(false);
    }
  };

  const currentCam = cameras.find(c => c.id === selectedCam);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-[#141024] border border-purple-500/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-purple-950/80">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-[#1e1338] to-[#141024] p-5 border-b border-purple-800/40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">{project?.name || 'DoSJE Site Surveillance'}</h3>
              <p className="text-xs font-mono text-purple-300/70">{project?.location || 'Live Monitoring System'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white hover:bg-purple-900/50 p-2 rounded-xl transition-all">
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-purple-900/40 bg-[#0f0c1b]">
          <button
            onClick={() => setActiveTab('cctv')}
            className={`flex-1 py-3 px-4 font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'cctv'
                ? 'bg-purple-900/40 text-purple-300 border-b-2 border-purple-500'
                : 'text-purple-400/60 hover:text-purple-300 hover:bg-purple-950/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            📹 CCTV Surveillance (Live Feed)
          </button>
          <button
            onClick={() => setActiveTab('vc')}
            className={`flex-1 py-3 px-4 font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'vc'
                ? 'bg-purple-900/40 text-purple-300 border-b-2 border-purple-500'
                : 'text-purple-400/60 hover:text-purple-300 hover:bg-purple-950/20'
            }`}
          >
            📞 Random Video Call (VC Verification)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'cctv' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Video Stream Container */}
              <div className="lg:col-span-2 space-y-3">
                <div className={`relative aspect-video rounded-2xl bg-gradient-to-br ${currentCam.color} border border-purple-700/50 overflow-hidden flex flex-col justify-between p-4 shadow-inner shadow-black`}>
                  
                  {/* Overlay Top bar */}
                  <div className="flex justify-between items-center z-10">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono border border-purple-500/30 text-purple-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${currentCam.status === 'ONLINE' ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
                      <span>{currentCam.id} • {currentCam.name}</span>
                    </div>
                    <span className="bg-purple-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-purple-300 border border-purple-700/40">
                      {currentCam.resolution} @ {currentCam.fps} FPS
                    </span>
                  </div>

                  {/* Simulated Stream Graphics */}
                  <div className="my-auto text-center space-y-2 py-8">
                    {currentCam.status === 'ONLINE' ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300 animate-pulse">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="font-mono text-sm text-purple-200 tracking-wider">LIVE STREAM ENCRYPTED FEED ACTIVE</p>
                        <p className="text-xs text-purple-400/80">DoSJE Central AI Motion & Face Detection Active</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-rose-900/30 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                          ✕
                        </div>
                        <p className="font-mono text-sm text-rose-300">CAMERA OFFLINE / DISCONNECTED</p>
                        <p className="text-xs text-slate-400">Alert automatically dispatched to PMU Division</p>
                      </div>
                    )}
                  </div>

                  {/* Overlay Bottom timestamp */}
                  <div className="flex justify-between items-center text-xs font-mono text-purple-300/80 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-800/30">
                    <span>GPS: {project?.latitude || '13.0827'} N, {project?.longitude || '80.2707'} E</span>
                    <span>REC: {new Date().toISOString().slice(0, 19).replace('T', ' ')} IST</span>
                  </div>
                </div>
              </div>

              {/* Camera List Sidebar */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-semibold text-purple-300 uppercase tracking-wider">Active Site Cameras</h4>
                <div className="space-y-2.5">
                  {cameras.map(cam => (
                    <button
                      key={cam.id}
                      onClick={() => setSelectedCam(cam.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                        selectedCam === cam.id
                          ? 'bg-purple-900/50 border-purple-500 shadow-md shadow-purple-900/40'
                          : 'bg-[#1a152e]/60 border-purple-900/30 hover:border-purple-700/50 hover:bg-purple-950/40'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-purple-100 group-hover:text-white">{cam.name}</p>
                        <p className="text-xs font-mono text-purple-400/70">{cam.id} • {cam.resolution}</p>
                      </div>
                      <span className={`badge ${cam.status === 'ONLINE' ? 'badge-success' : 'badge-danger'}`}>
                        {cam.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* Video Call (VC) Tab */
            <div className="space-y-6">
              {!vcActive ? (
                <div className="bg-gradient-to-b from-[#1c1633] to-[#141024] p-8 rounded-2xl border border-purple-800/40 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">Initiate Random VC Inspection Call</h4>
                    <p className="text-sm text-purple-300/70 max-w-md mx-auto">
                      Connect directly via encrypted Video Conference with site staff or beneficiaries for spot verification.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto space-y-4 text-left">
                    <div>
                      <label className="label">Target Participant Role</label>
                      <select
                        value={vcRole}
                        onChange={(e) => setVcRole(e.target.value)}
                        className="input"
                      >
                        <option value="Project Incharge">Project Incharge / Director</option>
                        <option value="On-Site Staff">On-Site Field Staff</option>
                        <option value="Random Beneficiary">Random Beneficiary Verification</option>
                        <option value="PMU Inspector">PMU Field Inspector</option>
                      </select>
                    </div>

                    <button
                      onClick={handleStartVc}
                      disabled={loadingVc}
                      className="w-full btn-primary py-3.5 font-bold tracking-wide flex items-center justify-center gap-2"
                    >
                      {loadingVc ? 'Connecting Room...' : '📞 Connect Live VC Session Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-purple-900/30 p-3.5 rounded-xl border border-purple-700/40">
                    <div>
                      <p className="font-semibold text-sm text-purple-100">Live VC Session: <span className="font-mono text-purple-300">{vcRoom?.roomId}</span></p>
                      <p className="text-xs text-purple-400">Target: {vcRoom?.targetRole}</p>
                    </div>
                    <button
                      onClick={() => setVcActive(false)}
                      className="btn-danger text-xs px-4 py-2"
                    >
                      End Call Session
                    </button>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-purple-600/50 shadow-2xl bg-black">
                    <iframe
                      src={vcRoom?.meetingUrl}
                      title="DoSJE VC Inspection"
                      className="w-full h-full border-0"
                      allow="camera; microphone; fullscreen; display-capture"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0f0c1b] p-4 border-t border-purple-900/40 flex justify-between items-center text-xs font-mono text-purple-400/70">
          <span>DoSJE Automated Surveillance Standard v2.4</span>
          <span>Encrypted WebRTC Stream</span>
        </div>

      </div>
    </div>
  );
};

export default SurveillanceModal;
