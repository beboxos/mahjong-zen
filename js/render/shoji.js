/* render/shoji — portes coulissantes (ouvrir / fermer) + éclat doré. */
(function (MJ) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const S = {
    el: null,
    init(el) {
      this.el = el;
      // pétales sculptés du médaillon
      const g = el.querySelector('#petals');
      let s = '';
      for (let i = 0; i < 8; i++) s += `<path transform="rotate(${i * 45} 60 60)" d="M60 14 Q70 28 60 40 Q50 28 60 14Z"/>`;
      g.innerHTML = s;
    },
    isOpen() { return this.el.classList.contains('open'); },
    async open() {
      const e = this.el;
      document.getElementById('flash').classList.remove('go'); void e.offsetWidth;
      document.getElementById('flash').classList.add('go');
      MJ.Sfx && MJ.Sfx.door();
      e.classList.remove('closed'); e.classList.add('open');
      await wait(1150);
    },
    async close() {
      const e = this.el;
      MJ.Sfx && MJ.Sfx.door();
      e.classList.remove('open'); e.classList.add('closed');
      await wait(1150);
    },
  };
  MJ.Shoji = S;
})(window.MJ = window.MJ || {});
