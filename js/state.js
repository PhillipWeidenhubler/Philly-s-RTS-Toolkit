(() => {
  const RTS = (window.RTS = window.RTS || {});
  if (!RTS.state) {
    RTS.state = {
      weaponTemplates: {},
      ammoLibrary: {},
      weaponTags: {
        categories: {},
        calibers: {},
      },
    };
  }
})();
