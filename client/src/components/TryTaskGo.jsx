import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import herobg from "../assets/images/WebsiteImg/hero-bg.jpg";
import img2 from "../assets/images/WebsiteImg/benefit.jpg";

const TryTaskGo = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 mt-24 lg:mt-28 lg:mb-28 bg-gradient-to-r from-[#229ea6] to-[#668f92] text-white rounded-lg shadow-2xl overflow-hidden">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="w-full"
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 p-6">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                What is TaskGo?
              </h2>
              <p className="text-lg md:text-xl leading-relaxed drop-shadow-md mb-3">
                TaskGo is an all-in-one task and project management platform designed to help businesses, teams, and freelancers organize work, streamline collaboration, and maximize efficiency—all from a single, easy-to-use dashboard.
              </p>
              <p className="text-lg md:text-xl leading-relaxed drop-shadow-md">
                Say goodbye to scattered tasks and missed deadlines! With TaskGo, you can manage projects, assign tasks, and track progress effortlessly—whether you're a small team or a large enterprise.
              </p>
            </div>
            <div className="md:w-1/2 p-6 flex justify-center">
              <img
                src={herobg}
                alt="Sample"
                className="w-full md:w-3/4 h-auto object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
              />
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 p-6 flex justify-center">
              <img
                src={img2}
                alt="Sample"
                className="w-full md:w-3/4 h-auto object-cover rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
              />
            </div>
            <div className="md:w-1/2 p-6">
              
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                Benefits of Using TaskGo
              </h2>
              <h2 className="text-2xl font-bold mt-5">2x Faster Deadlines</h2>
              <ul>
                <li>Automate repetitive tasks and focus on what matters.</li>
              </ul>
              <h2 className="text-2xl font-bold mt-5">No More Silos</h2>
              <ul>
                <li>Break down communication barriers with centralized updates and feedback loops.</li>
              </ul>
              <h2 className="text-2xl font-bold mt-5">Grow Without Limits</h2>
              <ul>
                <li>Scale from 10 to 10,000 users without sacrificing speed or simplicity.</li>
              </ul>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default TryTaskGo;
