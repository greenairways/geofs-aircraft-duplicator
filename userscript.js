// ==UserScript==
// @name         GeoFS Aircraft Model Duplicator
// @namespace    geofs-model-freeze
// @version      1.0
// @description  Freezes an aircaft model
// @author       You
// @match        *://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.__geoFSFlightFixLoaded) return;
    window.__geoFSFlightFixLoaded = true;

    // -------------------------------
    // FLIGHT MODEL PATCH
    // -------------------------------
    function fixMyPlane() {

        if (!window.geofs?.aircraft?.instance) {
            alert("GeoFS not ready.\nLoad into cockpit first.");
            return;
        }

        const aircraft = geofs.aircraft.instance;
        const setup = aircraft.setup;

        if (!setup?.parts) {
            alert("Aircraft setup not available.");
            return;
        }

        // Lift boost
        setup.parts.forEach(part => {
            if (part.name && /wing|main|fuselage|stabilizer/i.test(part.name)) {
                part.liftFactor = 3.5;
            }
        });

        // Flap aerodynamics
        if (setup.flaps?.length) {
            setup.flaps.forEach((stage, i) => {
                stage.liftCoef = (i + 1) * 0.4;
                stage.dragCoef = (i + 1) * 0.1;
            });
        }

        // Zero-lift AoA
        setup.parts.forEach(part => {
            if (part.name && /wing/i.test(part.name)) {
                part.forceValues = part.forceValues || {};
                part.forceValues.alphaZeroLift = -5;
            }
        });

        aircraft.init(setup);

        console.log("✔ GeoFS flight model patched");
        alert("Aircraft model frozen. Switch to another aircraft to unpause game.");
    }

    // -------------------------------
    // UI BUTTON
    // -------------------------------
    function createButton() {

        if (document.getElementById("geoFSFlightFixBtn")) return;

        const btn = document.createElement("div");
        btn.id = "geoFSFlightFixBtn";
        btn.innerHTML = "🧊";

        Object.assign(btn.style, {
            position: "fixed",
            left: "10px",
            top: "80px",
            zIndex: 9999,

            width: "36px",
            height: "48px",

            background: "rgba(0,0,0,0.55)",
            color: "#fff",

            borderRadius: "9px",
            border: "1px solid rgba(255,255,255,0.15)",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            fontSize: "9.5px",
            fontWeight: "600",
            lineHeight: "1.1",

            cursor: "pointer",
            userSelect: "none",
            backdropFilter: "blur(6px)"
        });

        btn.onmouseenter = () =>
            btn.style.background = "rgba(30,144,255,0.75)";

        btn.onmouseleave = () =>
            btn.style.background = "rgba(0,0,0,0.55)";

        btn.onclick = fixMyPlane;

        document.body.appendChild(btn);

        // H key toggle
        let visible = true;
        window.addEventListener("keydown", (e) => {
            if (e.code === "KeyH" && !e.repeat) {
                visible = !visible;
                btn.style.display = visible ? "flex" : "none";
            }
        });
    }

    // -------------------------------
    // WAIT FOR GEOFS TO LOAD
    // -------------------------------
    const waitForGeoFS = setInterval(() => {
        if (window.geofs && document.body) {
            clearInterval(waitForGeoFS);
            createButton();
            console.log("GeoFS Flight Fix button initialized");
        }
    }, 500);

})();
