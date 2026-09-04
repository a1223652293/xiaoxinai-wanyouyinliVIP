(function () {
  'use strict';

  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const pageUrlEl = document.getElementById('pageUrl');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const qrBox = document.getElementById('qrBox');
  const qrDownloadBtn = document.getElementById('qrDownloadBtn');
  const config = window.SITE_CONFIG || {};
  let qrCanvas = null;

  function applyDownloadConfig() {
    const downloadBtn = document.getElementById('downloadBtn');
    const fileNameText = document.getElementById('fileNameText');
    const fileSizeText = document.getElementById('fileSizeText');
    const downloadBtnMeta = document.getElementById('downloadBtnMeta');

    if (!config.downloadUrl) {
      return;
    }

    downloadBtn.href = config.downloadUrl;
    if (config.downloadFileName) {
      downloadBtn.download = config.downloadFileName;
      if (fileNameText) fileNameText.textContent = config.downloadFileName;
    }
    if (config.downloadSizeLabel) {
      if (fileSizeText) fileSizeText.textContent = config.downloadSizeLabel;
      if (downloadBtnMeta) downloadBtnMeta.textContent = 'ZIP · ' + config.downloadSizeLabel;
    }
  }

  function setHeaderState() {
    header.classList.toggle('scrolled', window.scrollY > 18);
  }

  function closeMenu() {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '打开导航菜单');
    document.body.classList.remove('no-scroll');
  }

  function toggleMenu() {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
    document.body.classList.toggle('no-scroll', isOpen);
  }

  function makeQrImage(url) {
    if (!window.qrcode) {
      throw new Error('qrcode library not loaded');
    }

    const qr = window.qrcode(0, 'M');
    qr.addData(url, 'Byte');
    qr.make();

    const count = qr.getModuleCount();
    const cellSize = 9;
    const margin = 4;
    const size = (count + margin * 2) * cellSize;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#10141b';

    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            (col + margin) * cellSize,
            (row + margin) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    qrBox.replaceChildren(canvas);
    return canvas;
  }

  function initQr() {
    const currentUrl = window.location.href;
    pageUrlEl.textContent = currentUrl;
    pageUrlEl.title = currentUrl;

    try {
      qrCanvas = makeQrImage(currentUrl);
    } catch (error) {
      qrBox.textContent = '请使用浏览器打开本页后查看二维码';
      qrBox.style.fontSize = '0.9rem';
      qrBox.style.color = '#69707c';
    }
  }

  setHeaderState();
  applyDownloadConfig();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  navToggle.addEventListener('click', toggleMenu);
  mainNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  copyUrlBtn.addEventListener('click', async function () {
    const url = pageUrlEl.textContent;
    const original = copyUrlBtn.textContent;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const temp = document.createElement('textarea');
        temp.value = url;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      copyUrlBtn.textContent = '已复制';
    } catch (error) {
      copyUrlBtn.textContent = '复制失败';
    }

    window.setTimeout(function () {
      copyUrlBtn.textContent = original;
    }, 1800);
  });

  qrDownloadBtn.addEventListener('click', function () {
    if (!qrCanvas) {
      return;
    }

    const link = document.createElement('a');
    link.href = qrCanvas.toDataURL('image/png');
    link.download = '小新AI官网二维码.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  initQr();
})();
