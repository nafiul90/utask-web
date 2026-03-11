"use client";

import React, { useState, useRef, useCallback } from "react";
import { Mic, StopCircle, Play, Upload, Circle } from "lucide-react";
import { Api } from "../lib/api";
import AudioPlayer from "react-h5-audio-player";

interface AudioRecorderProps {
  token: string;
  onUpload: (attachment: any) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  token,
  onUpload,
  disabled,
}) => {
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioUrlRef = useRef<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
      console.error("Mic denied - allow browser mic permission");
      alert("Allow microphone permission in browser (lock icon) and try again");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const uploadRecording = async () => {
    if (!recordedAudio) return;

    setUploading(true);
    try {
      const audioFile = new File([recordedAudio], "task-audio-recording.webm", {
        type: "audio/webm",
      });
      const uploaded = await Api.uploadFile(token, audioFile);
      onUpload(uploaded);
      setRecordedAudio(null);
      audioUrlRef.current = null;
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed - try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-dashed border-white/20 rounded-xl bg-white/5">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled || uploading}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 transition text-white disabled:opacity-50 text-sm font-medium"
      >
        {recording ? (
          <>
            <StopCircle className="text-red-400" size={20} />
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={20} />
            Start Recording Audio Note
          </>
        )}
      </button>

      {recordedAudio && (
        <div
          className="space-y-2 p-3 bg-white/5 rounded-lg"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* <audio
            src={audioUrlRef.current!}
            controls
            className="w-full rounded border border-white/20"
          /> */}
          <AudioPlayer
            src={audioUrlRef.current!}
            // controls
            // accentColor="grey"
            style={{ backgroundColor: "#0f1323", borderColor: "#616161ff" }}
            className="border border-sm border-dashed rounded-xl"
          />
          <button
            onClick={uploadRecording}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 text-green-300 transition disabled:opacity-50 text-sm font-medium"
          >
            <Upload size={20} />
            {uploading ? "Uploading..." : "Add to Attachments"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
