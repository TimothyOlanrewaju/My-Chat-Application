import { useState, useEffect, useRef } from "react";
import { 
  useMessageInputContext,
  TextareaComposer,
  AttachmentPreviewList,
  LinkPreviewList,
  QuotedMessagePreview,
  SimpleAttachmentSelector,
  SendButton
} from "stream-chat-react";
import { Mic, Square } from "lucide-react";

// Custom Input component that uses MessageInputContext
export default function CustomMessageInput() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecognitionReady, setIsRecognitionReady] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const isManualStopRef = useRef<boolean>(false);
  const currentTranscriptRef = useRef<string>("");
  
  // Access the MessageInput context
  const { handleSubmit, textareaRef } = useMessageInputContext();

  // Function to update textarea value properly
  const updateTextareaValue = (value: string) => {
    if (!textareaRef.current) return;
    
    // Use React's way to update the textarea properly
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textareaRef.current, value);
      
      // Trigger input events to notify React of the change
      const inputEvent = new Event('input', { bubbles: true });
      textareaRef.current.dispatchEvent(inputEvent);
      textareaRef.current.focus();
    }
  };

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        // Process all results from the last processed index
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + " ";
          } else {
            interimTranscript += transcriptSegment;
          }
        }

        // Update the current transcript
        if (finalTranscript) {
          currentTranscriptRef.current += finalTranscript;
        }

        // Combine stored final transcript with current interim results
        const combinedTranscript = (currentTranscriptRef.current + interimTranscript).trim();
        
        // Update the textarea
        if (combinedTranscript) {
          updateTextareaValue(combinedTranscript);
        }
      };

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true);
        currentTranscriptRef.current = ""; // Reset transcript on start
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
        
        // If it wasn't manually stopped and we're still supposed to be recording, restart
        if (!isManualStopRef.current && isRecording) {
          try {
            recognition.start();
          } catch (error) {
            console.error("Error restarting recognition:", error);
          }
        }
        
        isManualStopRef.current = false;
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        isManualStopRef.current = false;

        switch (event.error) {
          case "no-speech":
            console.warn("No speech detected");
            // Don't show alert for no-speech, just log it
            break;
          case "not-allowed":
            alert(
              "Microphone access denied. Please allow microphone permissions.",
            );
            break;
          case "network":
            alert("Network error occurred. Please check your connection.");
            break;
          case "aborted":
            console.log("Speech recognition aborted");
            break;
          default:
            console.error("Speech recognition error:", event.error);
        }
      };

      recognitionRef.current = recognition;
      setIsRecognitionReady(true);
    } else {
      console.warn("Web Speech API not supported in this browser.");
      setIsRecognitionReady(false);
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Removed textareaRef and isRecording from dependencies

  // Toggle recording function
  const toggleRecording = async (): Promise<void> => {
    if (!recognitionRef.current) {
      alert("Speech recognition not available");
      return;
    }

    if (isRecording) {
      // Stop recording
      isManualStopRef.current = true;
      recognitionRef.current.stop();
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Clear current text and reset transcript before starting
        currentTranscriptRef.current = "";
        updateTextareaValue("");

        // Start recognition
        recognitionRef.current.start();
      } catch (error) {
        console.error("Microphone access error:", error);
        alert(
          "Unable to access microphone. Please check permissions and try again.",
        );
      }
    }
  };

  return (
    <>
      {/* Recording notification */}
      {isRecording && (
        <div className="recording-notification show">
          <span className="recording-icon">🎤</span>
          Recording... Click stop when finished
        </div>
      )}

      <div className="str-chat__message-input">
        <div className="str-chat__message-input-left">
          <SimpleAttachmentSelector />
          
          {/* Voice recording button */}
          <button
            onClick={toggleRecording}
            className={`voice-input-button ${isRecording ? 'recording' : 'idle'}`}
            title={isRecording ? "Stop recording" : "Start voice input"}
            disabled={!isRecognitionReady}
            type="button"
          >
            {isRecording ? (
              <Square size={20} className="voice-icon recording-icon" />
            ) : (
              <Mic size={20} className="voice-icon idle-icon" />
            )}
          </button>
        </div>
        
        <div className="str-chat__message-input-center">
          <QuotedMessagePreview />
          <LinkPreviewList />
          <AttachmentPreviewList />
          <div className="str-chat__message-input-inner">
            <TextareaComposer aria-disabled={false}/>
          </div>
        </div>
        
        <div className="str-chat__message-input-right">
          <SendButton sendMessage={handleSubmit} />
        </div>
      </div>
    </>
  );
};

