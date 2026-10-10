const stages = document.querySelectorAll("[data-robot-stage]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const gsapApi = window.gsap;

const viewSequence = ["front", "side-right", "back", "side-left"];

function wrapIndex(index) {
  return ((index % viewSequence.length) + viewSequence.length) % viewSequence.length;
}

stages.forEach((stage) => {
  const robot = stage.querySelector("[data-css-robot]");
  if (!robot) return;

  const viewNodes = {
    front: robot.querySelector(".robot-front"),
    "side-right": robot.querySelector(".robot-side-view"),
    back: robot.querySelector(".robot-back-view"),
    "side-left": robot.querySelector(".robot-side-view"),
  };
  const uniqueViews = Array.from(new Set(Object.values(viewNodes).filter(Boolean)));
  const glow = stage.querySelector(".chip-one");

  let viewIndex = 0;
  let startX = 0;
  let startIndex = 0;
  let isDragging = false;
  let autoTween = null;

  robot.classList.add("js-ready");

  function setRobotClass(viewName) {
    robot.classList.remove("view-front", "view-side-right", "view-back", "view-side-left");
    robot.classList.add(`view-${viewName}`);
  }

  function activeViewName() {
    return viewSequence[wrapIndex(viewIndex)];
  }

  function scheduleAuto(delay = 1.55) {
    if (reduceMotion || !gsapApi) return;
    if (autoTween) autoTween.kill();
    autoTween = gsapApi.delayedCall(delay, () => {
      if (isDragging) return;
      viewIndex = wrapIndex(viewIndex + 1);
      renderView();
      scheduleAuto();
    });
  }

  function renderView(instant = false) {
    const viewName = activeViewName();
    const activeNode = viewNodes[viewName];
    if (!activeNode) return;

    setRobotClass(viewName);
    uniqueViews.forEach((view) => view.classList.toggle("active", view === activeNode));

    const sideFlip = viewName === "side-left" ? -1 : 1;
    const stageAngle = {
      front: 0,
      "side-right": -13,
      back: 0,
      "side-left": 13,
    }[viewName];
    const enterAngle = {
      front: 12,
      "side-right": -24,
      back: 14,
      "side-left": 24,
    }[viewName];
    const xOffset = {
      front: 0,
      "side-right": 0,
      back: 78,
      "side-left": 0,
    }[viewName];

    if (!gsapApi) return;

    gsapApi.killTweensOf(uniqueViews);
    gsapApi.to(uniqueViews, {
      autoAlpha: 0,
      scale: 0.9,
      x: 0,
      xPercent: -50,
      yPercent: -50,
      rotateY: -enterAngle,
      filter: "blur(2px)",
      duration: instant || reduceMotion ? 0 : 0.58,
      ease: "power3.inOut",
      overwrite: true,
    });
    gsapApi.fromTo(
      activeNode,
      {
        autoAlpha: instant ? 1 : 0,
        scaleX: viewName === "side-left" ? -0.9 : 0.9,
        scaleY: 0.9,
        x: xOffset,
        xPercent: -50,
        yPercent: -50,
        rotateY: enterAngle,
        filter: "blur(2px)",
      },
      {
        autoAlpha: 1,
        scaleX: sideFlip,
        scaleY: 1,
        x: xOffset,
        xPercent: -50,
        yPercent: -50,
        rotateY: stageAngle,
        filter: "blur(0px)",
        duration: instant || reduceMotion ? 0 : 0.78,
        ease: "power3.inOut",
        overwrite: true,
      }
    );
  }

  function stopAuto() {
    if (autoTween) {
      autoTween.kill();
      autoTween = null;
    }
  }

  stage.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startIndex = viewIndex;
    stopAuto();
    robot.classList.add("is-interacting");
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;
    const nextIndex = startIndex + Math.round(delta / 68);
    if (nextIndex !== viewIndex) {
      viewIndex = wrapIndex(nextIndex);
      renderView();
    }
  });

  function endDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    robot.classList.remove("is-interacting");
    if (event?.pointerId !== undefined && stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    scheduleAuto(1.55);
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", endDrag);

  if (gsapApi && !reduceMotion) {
    gsapApi.fromTo(
      robot,
      { y: -12, scale: 0.96 },
      { y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
    gsapApi.to(robot, {
      y: -7,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 0.8,
    });
    if (glow) {
      gsapApi.to(glow, {
        scale: 1.05,
        autoAlpha: 0.82,
        duration: 1.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  renderView(true);
  scheduleAuto(3.2);
});
