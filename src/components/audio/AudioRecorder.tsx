"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, StopCircle, Play, Upload } from "lucide-react";
import { Api } from "../../lib/api";
import { AudioPlayer } from "react-video-audio-player";

interface AudioRecorderProps {
  token: string;
  onUpload: (file: any) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({
  token,
  onUpload,
  disabled,
}: AudioRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedAudio(blob);
        audioUrlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Recording failed:", error);
      alert("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrlRef.current) {
      audioRef.current.src = audioUrlRef.current;
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const uploadRecording = async () => {
    if (!recordedAudio) return;

    const audioFile = new File([recordedAudio], "recording.webm", {
      type: "audio/webm",
    });
    try {
      const uploaded = await Api.uploadFile(token, audioFile);
      onUpload(uploaded);
      setRecordedAudio(null);
      audioUrlRef.current = null;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  return (
    <div className="space-y-3 p-4 border border-dashed border-white/20 rounded-xl bg-white/5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          className="p-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition flex items-center gap-2 text-white disabled:opacity-50"
        >
          {recording ? (
            <>
              <StopCircle size={20} />
              Stop
            </>
          ) : (
            <>
              <Mic size={20} />
              Record
            </>
          )}
        </button>
        {recordedAudio && (
          <>
            {/* <button
              type="button"
              onClick={playRecording}
              className="p-3 rounded-full bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 transition text-green-300"
            >
              <Play size={20} />
            </button> */}
            <AudioPlayer
              src={audioUrlRef.current!}
              controls
              accentColor="grey"
              style={{ backgroundColor: "#0f1323", borderColor: "#616161ff" }}
              className="border border-sm border-dashed rounded-xl"
            />
            <button
              type="button"
              onClick={uploadRecording}
              className="ml-auto p-3 rounded-full bg-primary-500/20 border border-primary-500/40 hover:bg-primary-500/30 transition text-primary-300"
            >
              <Upload size={20} />
            </button>
          </>
        )}
      </div>
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
};
