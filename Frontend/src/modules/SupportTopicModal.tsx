import Modal from "@mui/material/Modal";
import React from "react";
import { FaPlus } from "react-icons/fa";
import Box from "@mui/material/Box";
import { Socket } from "socket.io-client";
interface Operator {
  id: string;
  name: string;
  isOnline: boolean;
}

interface Topic {
  id: string;
  title: string;
  operators: Operator[];
}

interface SupportTopicModalProps {
  topics: Topic[];
  selectSupportTopicModal: boolean;
  setSelectSupportTopicModal: (selectSupportTopicModal: boolean) => void;
  socket: typeof Socket | null;
}

const SupportTopicModal: React.FC<SupportTopicModalProps> = ({
  topics,
  selectSupportTopicModal,
  setSelectSupportTopicModal,
  socket,
}) => {
  const openModal = () => setSelectSupportTopicModal(true);
  const closeModal = () => setSelectSupportTopicModal(false);

  const handleJoin = (topicId: string) => {
    socket?.emit("support:joinTopic", topicId);
    setSelectSupportTopicModal(false);
  };

  return (
    <div>
      <FaPlus onClick={openModal} style={{ cursor: "pointer" }} />
      <Modal
        open={selectSupportTopicModal}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="modal-title">Support Topics</h2>
          <button onClick={closeModal}>Close</button>
          <table style={{ width: "100%", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Operators</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td>{topic.title}</td>
                  <td>{topic.operators.length} available</td>
                  <td>
                    <button
                      onClick={() => handleJoin(topic.id)}
                      disabled={topic.operators.length == 0}
                    >
                      Join
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Modal>
    </div>
  );
};

export default SupportTopicModal;
