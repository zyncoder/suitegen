import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { joinRoom } from 'trystero';
import { Link, Wifi, WifiOff, Copy, Check, Users, RefreshCw } from 'lucide-react';

const APP_ID = 'suitegen-clipboard-v1';

const SharedClipboard: React.FC = () => {
  const [text, setText] = useState('');
  const [roomId, setRoomId] = useState('');
  const [peers, setPeers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // Refs for Trystero actions to avoid re-creating them
  const roomRef = useRef<any>(null);
  const sendTextRef = useRef<any>(null);

  useEffect(() => {
    // 1. Resolve Room ID from URL or generate new one
    // Safe URL parsing that handles potential blob: origins
    let currentRoomId = '';
    let intendedUrlStr = '';

    try {
        const url = new URL(window.location.href);
        currentRoomId = url.searchParams.get('room') || '';

        if (!currentRoomId) {
            currentRoomId = crypto.randomUUID().slice(0, 8); // Short ID for readability
            
            // Construct the intended URL with the new room ID
            url.searchParams.set('tool', 'clipboard');
            url.searchParams.set('room', currentRoomId);
            intendedUrlStr = url.toString();

            // Attempt to update browser URL (might fail in sandboxed/blob environments)
            try {
                window.history.replaceState({}, '', intendedUrlStr);
            } catch (e) {
                console.warn('Could not update history state (likely sandbox environment):', e);
            }
        } else {
            intendedUrlStr = window.location.href;
        }
    } catch (e) {
        // Fallback for extreme edge cases
        console.error('Error parsing URL:', e);
        currentRoomId = crypto.randomUUID().slice(0, 8);
        intendedUrlStr = window.location.href; 
    }
    
    setRoomId(currentRoomId);
    setShareUrl(intendedUrlStr);

    // 2. Connect to Trystero
    const room = joinRoom({ appId: APP_ID }, currentRoomId);
    roomRef.current = room;

    const [sendText, getText] = room.makeAction('textUpdates');
    sendTextRef.current = sendText;

    // 3. Listen for peers
    room.onPeerJoin((id: string) => setPeers(prev => [...prev, id]));
    room.onPeerLeave((id: string) => setPeers(prev => prev.filter(p => p !== id)));

    // 4. Listen for text
    getText((data: any, peerId: string) => {
        // Simple last-write-wins (could be improved with CRDTs, but overkill for this)
        if (typeof data === 'string') {
            setText(data);
        }
    });

    return () => {
      if (roomRef.current) {
        roomRef.current.leave();
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setText(newVal);
    
    // Broadcast changes
    if (sendTextRef.current) {
       sendTextRef.current(newVal);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const regenerateRoom = () => {
      if(confirm("This will disconnect you from the current room. Continue?")) {
        const newRoomId = crypto.randomUUID().slice(0, 8);
        
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('tool', 'clipboard');
            url.searchParams.set('room', newRoomId);
            window.location.href = url.toString();
        } catch (e) {
            // Fallback if URL parsing fails
            window.location.reload();
        }
      }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors">
      
      {/* Main Content: Text Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">
         <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                 <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Board</h2>
                 {peers.length > 0 ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {peers.length} Peer{peers.length !== 1 ? 's' : ''}
                    </span>
                 ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                        <Wifi className="w-3 h-3" />
                        Waiting for peers...
                    </span>
                 )}
             </div>
             <button
                onClick={copyContent}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
             >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                Copy Text
             </button>
         </div>

         <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Type here to sync with other devices..."
            className="flex-1 w-full p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm md:text-base focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors shadow-sm"
            spellCheck={false}
         />
         <p className="mt-2 text-xs text-gray-400 text-center lg:text-left">
            Content is shared peer-to-peer and is not stored on any server.
         </p>
      </div>

      {/* Sidebar: Connection Info */}
      <div className="w-full lg:w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-xl lg:shadow-none">
          
          <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Connection</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-4">
                  {/* QR Code Container - Always white background for readability */}
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                      {shareUrl && (
                          <QRCodeSVG 
                            value={shareUrl} 
                            size={160}
                            level="M"
                          />
                      )}
                  </div>
                  <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Scan to join this room</p>
                      <button 
                        onClick={copyUrl}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                         {urlCopied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                         Copy Join Link
                      </button>
                  </div>
              </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Room ID</label>
                <div className="flex gap-2 mt-1">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200">
                        {roomId}
                    </code>
                    <button 
                        onClick={regenerateRoom}
                        title="Generate New Room"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
             </div>

             <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                 <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                     <Wifi className="w-4 h-4" />
                     How it works
                 </h4>
                 <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                     This tool uses WebRTC to create a direct connection between devices. No data is sent to a central server. Both devices must be online to sync.
                 </p>
             </div>
          </div>
      </div>

    </div>
  );
};

export default SharedClipboard;