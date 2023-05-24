import React from "react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero--header">Could YOU be the next Warren Buffett?</h1>
        <p className="hero--text">
          Try our mock stock trading simulator for FREE!<br></br>
          You literally need $0 to start today!
        </p>
        <img
          src={require("../assets/images/gatsby.jpg")}
          className="hero--photo"
        />
      </div>
    </section>
  );
}
