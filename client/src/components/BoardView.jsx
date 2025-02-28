import React from "react";
    import TaskCard from "./TaskCard";

    const BoardView = ({ tasks = [] }) => {
        if (tasks.length === 0) {
          return (
            <div className="w-full py-4">
                <p>No tasks available.</p>
            </div>
          );
        }

      return (
        <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
          {tasks.map((task, index) => (
            <TaskCard
              task={task}
              key={task._id || index}
              className={task.dynamicClass}
            />
          ))}
        </div>
      );
    };

    export default BoardView;