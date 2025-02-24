import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Settings.css"; // Import CSS file for custom styles
import { TbLogout2 } from "react-icons/tb";

function Settings() {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<File | null>(null);
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [bio, setBio] = useState("");

  const handleClick = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/dashboard`,
        {
          firstname,
          lastname,
          username,
          email,
          profile: profileName,
          bio,
          customStatus: status,
        },
        {
          withCredentials: true,
          method: "application/json",
        }
      )
      .then(() => {
        navigate("/chats");
      })
      .catch((err) => {
        if (err?.response?.status === 401) navigate("/");
      });
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_BASE_URL}/dashboard/whoami`, {
        withCredentials: true,
      })
      .then((response) => {
        setFirstname(response.data.responseObject.firstname);
        setLastname(response.data.responseObject.lastname);
        setUsername(response.data.responseObject.username);
        setProfileName(response.data.responseObject.profile);
        setEmail(response.data.responseObject.email);
        setStatus(response.data.responseObject.customStatus);
        setBio(response.data.responseObject.bio);
      })
      .catch((err) => {
        if (err?.response?.status === 401) navigate("/");
      });
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfile(e.target.files[0]);

      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      axios
        .post(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/upload/file`,
          formData,
          {
            withCredentials: true,
            method: "multipart/form-data",
          }
        )
        .then((res) => {
          setProfileName(res.data.responseObject.filePath);
        })
        .catch((err) => {
          if (err?.response?.status === 401) navigate("/");
        });
    }
  };

  const logoutHandler = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_BASE_URL}/auth/logout`, {
        withCredentials: true,
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/register");
        }
      });
  };

  return (
    <div className="settings-container" style={{ fontFamily: "Poppins" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <h1>Settings</h1>
        <div
          onClick={logoutHandler}
          style={{
            height: "100%",
            boxSizing: "border-box",
            padding: "5px",
            position: "relative",
          }}
        >
          <TbLogout2
            size={35}
            cursor={"pointer"}
            style={{ position: "absolute", top: -10 }}
          />
        </div>
      </div>
      <p className="settings-description">
        Here, you can change, add, or remove data from your profile!
      </p>
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            id="firstname"
            className="input-field"
            value={firstname}
            onChange={(e): void => setFirstname(e.target.value)}
            style={{ fontFamily: "Poppins" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastname">Last Name</label>
          <input
            type="text"
            id="lastname"
            className="input-field"
            value={lastname}
            onChange={(e): void => setLastname(e.target.value)}
            style={{ fontFamily: "Poppins" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="input-field"
            value={username}
            onChange={(e): void => setUsername(e.target.value)}
            style={{ fontFamily: "Poppins" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            className="input-field"
            value={email}
            onChange={(e): void => setEmail(e.target.value)}
            style={{ fontFamily: "Poppins" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture</label>
          <input
            type="file"
            id="profilePicture"
            accept="image/*"
            onChange={handleProfileChange}
            style={{ fontFamily: "Poppins" }}
          />
          <br />
          {profileName ? (
            <div>
              <span>Current Prictue:</span>
              <img
                src={`${import.meta.env.VITE_BACKEND_BASE_URL}/${profileName}`}
                alt={profileName}
                height={50}
                width={50}
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <input
            type="text"
            id="status"
            className="input-field"
            value={status}
            onChange={(e): void => setStatus(e.target.value)}
            style={{ fontFamily: "Poppins" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            className="textarea-field"
            cols={30}
            rows={5}
            maxLength={75}
            value={bio}
            onChange={(e): void => setBio(e.target.value)}
            style={{ fontFamily: "Poppins" }}
          ></textarea>
        </div>

        <button className="submit-button" onClick={handleClick}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default Settings;
