import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

function CodeReview({ editorRef }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);

  const fetchCodeReview = async () => {
    try {
      setLoading(true);
      setError(null);

      const code = editorRef.current?.getValue();

      if (!code || code.trim() === "") {
        setError("Code editor is empty");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${API_URL}/codeAssistant/reviewCode`,
        { code },
        { withCredentials: true }
      );

      setReview(res.data);
      sessionStorage.setItem("code_review", JSON.stringify(res.data));
    } catch (err) {
      setError("Failed to fetch code review");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    sessionStorage.removeItem("code_review");
    setReview(null);
    fetchCodeReview();
  };

  useEffect(() => {
    const savedReview = sessionStorage.getItem("code_review");

    if (savedReview) {
      setReview(JSON.parse(savedReview));
      return;
    }

    fetchCodeReview();
  }, []);

  if (loading)
    return (
      <div className="h-[90vh] flex items-center justify-center text-white bg-[#111827]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-4 text-xl">Analyzing your code…</span>
      </div>
    );

  if (error)
    return (
      <div className="h-[90vh] flex flex-col items-center justify-center text-center space-y-4 bg-[#111827]">
        <p className="text-red-400 text-lg">{error}</p>

        <button
          onClick={handleRefresh}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm shadow"
        >
          Refresh Review
        </button>
      </div>
    );

  if (!review) return null;

  return (
    <div
      className="h-[86vh] md:h-[75vh] lg:h-[90vh] overflow-y-auto p-8 rounded-lg shadow-lg mx-auto relative"
      style={{
        backgroundColor: "#111827",
        border: "1px solid #374151",
        maxWidth: "900px",
      }}
    >
      <button
        onClick={handleRefresh}
        className="absolute top-4 right-6 px-4 py-2 rounded-lg bg-blue-600 transition hover:bg-blue-700 text-white text-sm shadow"
      >
        Refresh Review
      </button>

      <h1 className="text-3xl font-semibold text-white mb-8 text-center">
        Code Review Summary
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section
          className="bg-[#1f2937] p-6 rounded-lg shadow-sm text-center"
          style={{ border: "1px solid #374151" }}
        >
          <h2 className="text-lg font-medium text-blue-300">Time Complexity</h2>
          <p className="mt-3 text-gray-200 text-base font-medium">
            {review.time_complexity}
          </p>
        </section>

        <section
          className="bg-[#1f2937] p-6 rounded-lg shadow-sm text-center"
          style={{ border: "1px solid #374151" }}
        >
          <h2 className="text-lg font-medium text-purple-300">
            Space Complexity
          </h2>
          <p className="mt-3 text-gray-200 text-base font-medium">
            {review.space_complexity}
          </p>
        </section>
      </div>

      <section
        className="bg-[#1f2937] p-6 rounded-lg shadow-sm mt-6"
        style={{ border: "1px solid #374151" }}
      >
        <h2 className="text-lg font-medium text-green-300">Optimized Code</h2>

        <pre className="mt-4 bg-black/40 p-4 rounded-lg text-green-400 text-[13px] overflow-x-auto whitespace-pre-wrap">
          {review.optimized_code}
        </pre>
      </section>

      <section
        className="bg-[#1f2937] p-6 rounded-lg shadow-sm mt-6 mb-4"
        style={{ border: "1px solid #374151" }}
      >
        <h2 className="text-lg font-medium text-pink-300">Reasoning</h2>

        <ul className="mt-4 list-disc ml-6 text-gray-300 space-y-2 text-sm">
          {review.reasoning.map((point, index) => (
            <li key={index}>{point.replace("• ", "")}</li>
          ))}
        </ul>
      </section>

      <section
        className="bg-[#1f2937] p-6 rounded-lg shadow-sm mt-6"
        style={{ border: "1px solid #374151" }}
      >
        <h2 className="text-lg font-medium text-yellow-300">Best Practices</h2>
        <ul className="mt-4 list-disc ml-6 text-gray-300 space-y-2 text-sm">
          {review.best_practices.map((bp, i) => (
            <li key={i}>{bp}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default CodeReview;
