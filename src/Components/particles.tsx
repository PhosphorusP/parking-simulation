export const particles = {
  fullScreen: {
    enable: false,
  },
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: false,
        mode: "attract",
      },
      onHover: {
        enable: true,
        mode: "attract",
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 0,
      },
      attract: {
        distance: 512,
        rotate: 90,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 50,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: "right",
      enable: true,
      outModes: {
        default: "out",
      },
      random: false,
      speed: {
        min: 0.5,
        max: 1.5,
      },
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 400,
      },
      value: 300,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 2 },
    },
  },
  detectRetina: true,
};
