import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import UserAvatar from "./UserAvatar";
import { FaGamepad } from "react-icons/fa";
import BubblePopGame from "./GameModal";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [showGameMenu, setShowGameMenu] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null); // 'bubble' or null

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setShowGameMenu(false);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0">
        <div className="flex gap-4">
          <button
            onClick={() => dispatch(setOpenSidebar(true))}
            className="text-2xl text-gray-500 block md:hidden"
          >
            ☰
          </button>
        </div>

        <div className="flex gap-2 items-center relative">
          <button onClick={() => setShowGameMenu(true)}>
            <FaGamepad className="text-4xl text-[#229ea6] me-5" />
          </button>
          <UserAvatar />
          <h1 className="text-black font-medium">
            <span className="block text-[#229ea6] font-bold">{user.name}</span>
            <span>{user.isAdmin ? "Admin" : "User"}</span>
          </h1>
        </div>
      </div>

      {/* Game Menu */}
      {showGameMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center relative">
            <h2 className="text-xl font-semibold mb-4">Choose a Game</h2>
            <button
              onClick={() => handleGameSelect("bubble")}
              className="w-full py-2 mb-2 bg-[#229ea6] text-white rounded hover:bg-[#1b868e]"
            >
              Bubble Pop
            </button>
            <button
              onClick={() => setShowGameMenu(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Bubble Pop Game */}
      {selectedGame === "bubble" && <BubblePopGame onClose={closeGame} />}
    </>
  );
};

export default Navbar;
