import { useState, FormEvent } from "react";

// Access backend API from environment variables
const backendApi = process.env.REACT_APP_BACKEND_API;

interface Format {
  formatId: string;
  resolution: string;
  extension: string;
}

export default function Index() {
  const [videoLink, setVideoLink] = useState<string>("");
  const [formats, setFormats] = useState<Format[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  // Handle form submission to get formats and show video
  const handleGetVideo = async (event: FormEvent) => {
    event.preventDefault();
    if (!videoLink) {
      setError("Please enter a YouTube link");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Clear the previous video and formats
      setVideoPreview(null);
      setFormats([]);

      // Get available formats from the server
      const response = await fetch(`${backendApi}/get-formats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: videoLink }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch video formats");
      }

      const data = await response.json();
      setFormats(data);

      // Show video preview
      setVideoPreview(`https://www.youtube.com/embed/${videoLink.split("v=")[1]}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a form element dynamically and submit it
  const handleDownload = (formatId: string) => {
    setDownloadingFormat(formatId); // Set the format being downloaded

    // Create a hidden form to submit a POST request to the backend
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${backendApi}/download`;

    const linkInput = document.createElement("input");
    linkInput.type = "hidden";
    linkInput.name = "link";
    linkInput.value = videoLink;

    const formatInput = document.createElement("input");
    formatInput.type = "hidden";
    formatInput.name = "formatId";
    formatInput.value = formatId;

    form.appendChild(linkInput);
    form.appendChild(formatInput);

    document.body.appendChild(form);
    form.submit();

    // Clean up
    document.body.removeChild(form);

    // Keep spinner visible until download starts
    setTimeout(() => {
      setDownloadingFormat(null); // Reset downloading state after a short delay
    }, 2000); // 2 second delay as an example
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full transform transition-all duration-500 hover:scale-105">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-gradient-text">
            Mujju's Video Downloader
          </h1>
          <p className="text-lg text-gray-600 mt-4">Download videos from YouTube with style!</p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleGetVideo} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              name="videoLink"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=example"
              className="block w-full px-6 py-4 text-lg text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transform transition-all duration-300 focus:scale-105"
              required
            />
            <button
              type="submit"
              className={`w-full mt-6 px-6 py-4 text-xl font-bold text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-400 to-blue-600"
              } rounded-full shadow-lg hover:from-green-500 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-300`}
              disabled={isLoading}
            >
              {isLoading ? "Fetching..." : "Get Video"}
            </button>
          </div>
        </form>

        {/* Loader */}
        {isLoading && (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-400"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-500 mt-6 text-center text-lg font-semibold">{error}</p>
        )}

        {/* Video Preview */}
        {videoPreview && !isLoading && (
          <div className="mt-10">
            <iframe
              width="100%"
              height="360"
              src={videoPreview}
              frameBorder="0"
              allowFullScreen
              className="rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
              title="YouTube Video Preview"
            ></iframe>
          </div>
        )}

        {/* Available Formats */}
        {formats.length > 0 && !isLoading && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Available Formats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {formats.map((format) => (
                <div
                  key={format.formatId}
                  className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="font-semibold text-lg text-gray-700">
                    {format.resolution} ({format.extension})
                  </span>
                  <button
                    onClick={() => handleDownload(format.formatId)}
                    className={`px-6 py-2 text-lg font-semibold text-white bg-gradient-to-r from-green-400 to-blue-600 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ${
                      downloadingFormat === format.formatId ? "bg-gray-400 cursor-not-allowed" : ""
                    }`}
                    disabled={downloadingFormat === format.formatId} // Disable while downloading
                  >
                    {downloadingFormat === format.formatId ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      "Download"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
