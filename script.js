(() => {
  // Utility to generate frame text based on index
  const buildFrameText = (i, text, emoji) => {
    if (i === 0) return `${emoji}`;
    if (i === 1) return `${emoji}${emoji}`;
    if (i > 1 && i <= text.length + 1) {
      const partial = text.substring(0, i - 1);
      return `${emoji} ${partial} ${emoji}`;
    }
    return `${emoji} ${text} ${emoji}`;
  };

  // Adds frames to GIF using the provided drawing context
  const addFrames = (ctx, gif, options) => {
    const { text, emoji, fontSize, textColor, bgColor, delay, backgroundImage } = options;

    for (let i = 0; i <= text.length + 2; i++) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (backgroundImage) {
        const imgRatio = backgroundImage.width / backgroundImage.height;
        let imgWidth = ctx.canvas.width;
        let imgHeight = imgWidth / imgRatio;
        if (imgHeight < ctx.canvas.height) {
          imgHeight = ctx.canvas.height;
          imgWidth = imgHeight * imgRatio;
        }
        const xOffset = (ctx.canvas.width - imgWidth) / 2;
        const yOffset = (ctx.canvas.height - imgHeight) / 2;
        ctx.drawImage(backgroundImage, xOffset, yOffset, imgWidth, imgHeight);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }

      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 2;

      const frameText = buildFrameText(i, text, emoji);
      ctx.fillText(frameText, ctx.canvas.width / 2, ctx.canvas.height / 2);
      gif.addFrame(ctx, { copy: true, delay });
    }
  };

  const init = () => {
    const emojiInput = document.getElementById('emojiInput');
    const textInput = document.getElementById('textInput');
    const speedInput = document.getElementById('speedInput');
    const bgInput = document.getElementById('backgroundInput');
    const bgColorInput = document.getElementById('bgColorInput');
    const textColorInput = document.getElementById('textColorInput');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const outputDiv = document.getElementById('output');
    const speedValue = document.getElementById('speedValue');
    const fontSizeValue = document.getElementById('fontSizeValue');

    speedInput.addEventListener('input', () => {
      speedValue.textContent = speedInput.value;
    });

    fontSizeInput.addEventListener('input', () => {
      fontSizeValue.textContent = `${fontSizeInput.value}px`;
    });

    document.getElementById('generateBtn').addEventListener('click', () => {
      const text = textInput.value;
      const emoji = emojiInput.value;
      if (!text || !emoji) {
        alert('Please enter both text and emoji!');
        return;
      }

      const delay = 500 - (speedInput.value - 1) * 50;
      const fontSize = parseInt(fontSizeInput.value, 10);
      const textColor = textColorInput.value;
      const bgColor = bgColorInput.value;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;

      const gif = new GIF({
        workers: 2,
        quality: 1,
        width: canvas.width,
        height: canvas.height,
        workerScript: '/animgif/gif.worker.js'
      });

      const startRender = (backgroundImage) => {
        addFrames(ctx, gif, { text, emoji, fontSize, textColor, bgColor, delay, backgroundImage });
        gif.on('finished', (blob) => {
          outputDiv.innerHTML = '';
          const img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          outputDiv.appendChild(img);

          const link = document.createElement('a');
          link.href = img.src;
          link.download = 'text-emoji.gif';
          link.innerText = 'Download GIF';
          outputDiv.appendChild(link);
        });
        gif.render();
      };

      const file = bgInput.files[0];
      if (file) {
        const reader = new FileReader();
        const backgroundImage = new Image();
        reader.onload = (e) => {
          backgroundImage.src = e.target.result;
          backgroundImage.onload = () => startRender(backgroundImage);
        };
        reader.readAsDataURL(file);
      } else {
        startRender(null);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', init);
})();
