import React, { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Monitor } from "lucide-react";
import { Modal } from "@/shared/components/Modal/Modal";
import { cn } from "@/core/utils/helpers";

const ScreenCard = React.memo(({ s, onClick }) => (

  <Card 
    className="group relative rounded-[32px] overflow-hidden border-white/5 bg-black/40 hover:border-primary/50 transition-all cursor-pointer shadow-2xl" 
    onClick={() => onClick(s)}
  >
    <div className="aspect-video bg-black relative">
      <img src={s.frame} alt={s.studentName} className="w-full h-full object-contain" />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-white uppercase italic truncate max-w-[120px]">{s.studentName}</p>
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{s.studentRoll || "LIVE"}</p>
          </div>
          <div className="flex items-center gap-2">
            {s.violationCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 rounded-lg text-[8px] font-black animate-pulse">
                {s.violationCount} ALERTS
              </Badge>
            )}
            <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  </Card>
));

export const LiveScreenGrid = ({ examId }) => {
  const socket = useSocket();
  const [screens, setScreens] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [debugInfo, setDebugInfo] = useState({ joins: 0, packets: 0, lastPacketTime: null });

  useEffect(() => {
    if (!socket || !examId) return;

    console.log(`🔌 [SURVEILLANCE] Connecting to room: monitoring-${examId}`);
    socket.emit("join-exam-room-monitoring", examId);
    setDebugInfo(d => ({ ...d, joins: d.joins + 1 }));

    const handleScreenUpdate = (data) => {
      console.log(`📥 RECEIVED screen-update: ${data.studentName} (${data.studentId})`);
      setDebugInfo(d => ({ ...d, packets: d.packets + 1, lastPacketTime: new Date() }));
      setScreens((prev) => {
        return {
          ...prev,
          [data.studentId]: {
            ...data,
            lastUpdate: new Date(),
          },
        };
      });
    };

    socket.on("screen-update", handleScreenUpdate);

    const cleanup = setInterval(() => {
      const now = new Date();
      setScreens((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (now - next[id].lastUpdate > 15000) { // Increased timeout to 15s
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 10000);

    return () => {
      socket.off("screen-update", handleScreenUpdate);
      clearInterval(cleanup);
    };
  }, [socket, examId]);

  const studentList = React.useMemo(() => Object.values(screens), [screens]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
          <Monitor className="text-primary w-5 h-5" /> Live Student Screens
        </h3>
        <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 font-black">
          {studentList.length} Active Feeds
        </Badge>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
         <span className={cn("inline-flex items-center gap-2", socket?.connected ? "text-emerald-500" : "text-rose-500")}>
           <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
           {socket?.connected ? "Socket: Online" : "Socket: Link Lost"}
         </span>
         <span className="border-l border-white/10 pl-4">Packets: {debugInfo.packets}</span>
         {debugInfo.lastPacketTime && (
           <span className="border-l border-white/10 pl-4">Last: {debugInfo.lastPacketTime.toLocaleTimeString()}</span>
         )}
         <span className="border-l border-white/10 pl-4">Room: {examId.slice(-6)}</span>
      </div>

      {studentList.length === 0 ? (
        <div className="py-20 text-center bg-white/5 rounded-[40px] border-2 border-dashed border-white/5">
          <p className="text-muted-foreground font-black italic uppercase tracking-widest text-[10px] mb-2">No active feeds detected</p>
          <p className="text-[8px] font-black text-primary uppercase animate-pulse">Ensure students have started the exam and shared their screen</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {studentList.map((s) => (
            <ScreenCard key={s.studentId} s={s} onClick={setSelectedStudent} />
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={selectedStudent?.studentName} size="xl">
        {selectedStudent && (
          <div className="space-y-4 pt-4">
            <div className="aspect-video bg-black rounded-[24px] overflow-hidden border-4 border-white/5 shadow-2xl">
              <img src={selectedStudent.frame} alt={selectedStudent.studentName} className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center justify-between p-6 rounded-[24px] bg-white/5 border border-white/5 shadow-inner">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black italic text-xl">
                   {selectedStudent.studentName[0]}
                 </div>
                 <div>
                   <h4 className="font-black italic text-xl uppercase tracking-tight">{selectedStudent.studentName}</h4>
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Register No: {selectedStudent.studentRoll || selectedStudent.studentId}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Last Update</p>
                 <p className="font-black italic text-sm">{new Date(selectedStudent.lastUpdate).toLocaleTimeString()}</p>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

