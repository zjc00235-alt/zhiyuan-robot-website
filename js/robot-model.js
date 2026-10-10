const stages = document.querySelectorAll("[data-robot-stage]");

function normalizedAngle(deg) {
  return ((deg % 360) + 360) % 360;
}

stages.forEach((stage) => {
  const robot = stage.querySelector("[data-css-robot]");
  if (!robot) return;

  const front = robot.querySelector(".robot-front");
  const side = robot.querySelector(".robot-side-view");
  const back = robot.querySelector(".robot-back-view");
  const views = [front, side, back].filter(Boolean);
  robot.classList.add("js-ready");

  let rotation = 0;
  let startX = 0;
  let startRotation = rotation;
  let dragging = false;
  let autoRotate = window.setInterval(() => {
    if (dragging) return;
    rotation += 90;
    render();
  }, 2200);

  function setActive(view) {
    views.forEach((item) => item.classList.toggle("active", item === view));
  }

  function render() {
    const angle = normalizedAngle(rotation);
    robot.classList.remove("view-side-left", "view-side-right", "view-front", "view-back");

    if (angle >= 45 && angle < 135) {
      robot.classList.add("view-side-right");
      setActive(side);
    } else if (angle >= 135 && angle < 225) {
      robot.classList.add("view-back");
      setActive(back);
    } else if (angle >= 225 && angle < 315) {
      robot.classList.add("view-side-left");
      setActive(side);
    } else {
      robot.classList.add("view-front");
      setActive(front);
    }
  }

  stage.addEventListener("pointerdown", (event) => {
    dragging = true;
    window.clearInterval(autoRotate);
    robot.classList.add("is-interacting");
    startX = event.clientX;
    startRotation = rotation;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    rotation = startRotation + (event.clientX - startX) * 0.8;
    render();
  });

  function stopDrag(event) {
    if (!dragging) return;
    dragging = false;
    if (event?.pointerId !== undefined) {
      stage.releasePointerCapture(event.pointerId);
    }
    render();
  }

  stage.addEventListener("pointerup", stopDrag);
  stage.addEventListener("pointercancel", stopDrag);

  render();
});
