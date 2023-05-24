import React from "react";

export default function Developers() {
  return (
    <section className="dev">
      <div className="container">
        <h1>ABOUT</h1>
        <h4>Our Goal</h4>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>

        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>

        <h4>For You</h4>
        <p>Find your talent in investment TODAY!</p>

        <br />
        <hr />
        <h5>DEVELOPERS</h5>
        <img
          src="https://www.meme-arsenal.com/memes/863f56ff0a20da3861deb0e959881ee0.jpg"
          className="dev--img"
          alt="Programmer meme"
        />

        <ul>
          <li>
            <a href="https://github.com/yuneystudent/mock-stock-comp/">
              @github
            </a>
          </li>
        </ul>
        <p>Aspiring code campers: Melo, Maruna, SnowNoodle, EtVoila</p>
      </div>
    </section>
  );
}
