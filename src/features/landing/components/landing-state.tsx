"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 99.9,
    suffix: "%",
    label: "Delivery rate",
  },
  {
    value: 1000,
    suffix: "+",
    label: "Happy Customers",
  },
  {
    value: 100000,
    suffix: "+",
    label: "Messages Sent",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Support",
  },
];

function CountUp({ end, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [started, end]);

  const formatNumber = (num) => {
    if (end >= 100000) {
      return `${Math.floor(num / 1000)}K`;
    }

    if (end >= 1000) {
      return Math.floor(num).toLocaleString();
    }

    if (end % 1 !== 0) {
      return num.toFixed(1);
    }

    return Math.floor(num);
  };

  return (
    <div ref={ref} className="text-[32px] font-bold leading-none dark:text-white text-black">
      {formatNumber(count)}
      {suffix}
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-transparent py-20 w-full">
      <div className="mx-auto w-full">
        <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:gap-20 md:grid-cols-4 items-center justify-between ">
          {stats.map((item, index) => (
            <div key={index}>
              <CountUp end={item.value} suffix={item.suffix} />

              <p className="mt-3 text-[14px] bg-gradient-to-r from-violet-900 via-fuchsia-500 to-blue-600 bg-clip-text text-transparent lw-animate-gradient-text dark:from-violet-900 dark:via-fuchsia-500 dark:to-blue-900">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}