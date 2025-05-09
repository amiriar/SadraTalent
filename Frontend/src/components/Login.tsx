import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Include the CSS file for styling

const Login: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const verifyOtp = async () => {
    if (!phone || !otp) {
      setMessage("Both phone number and OTP are required.");
      setError(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/verify-otp`,
        { phone, code: otp },
        { withCredentials: true }
      );
      setMessage("Login successful.");
      setError(false);
      // Save the token for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.responseObject.accessToken}`;
      navigate("/chats");
    } catch (error) {
      setMessage("Invalid OTP or login failed.");
      setError(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_BASE_URL}/dashboard/whoami`, {
        withCredentials: true,
      })
      .then(() => {
        navigate("/chats");
        // navigate("/settings");
      });
  }, [navigate]);

  return (
    <div className="login-container" style={{ fontFamily: "Poppins" }}>
      <div className="login-form">
        <h2>Login</h2>
        <p>Please enter your phone number and OTP to log in.</p>
        <form>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className={`input-field ${error && !phone ? "error" : ""}`}
            style={{ fontFamily: "Poppins" }}
          />
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the OTP"
            className={`input-field ${error && !otp ? "error" : ""}`}
            style={{ fontFamily: "Poppins" }}
          />
          <button
            onClick={verifyOtp}
            disabled={isLoading}
            style={{ fontFamily: "Poppins" }}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
          {message && (
            <p
              className={`message ${
                error ? "error-message" : "success-message"
              }`}
              style={{ fontFamily: "Poppins" }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
