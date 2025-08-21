import React, { useEffect, useState } from 'react';
import './Board.css';
import io from 'socket.io-client';

const Board = ({ color }) => {
  const [socket, setSocket] = useState();
  const [imageData, setImageData] = useState(null);
  let timeout;

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null) return;

    socket.on('canvas-data', (data) => {
      setImageData(data);
      const image = new Image();
      const canvas = document.querySelector('#board'); // FIXED selector
      const ctx = canvas.getContext('2d');
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = data;
    });
  }, [socket]);

  useEffect(() => {
    if (socket && imageData) {
      socket.emit('canvas-data', imageData);
    }
  }, [imageData, socket]);

  useEffect(() => {
    drawOnCanvas();
    if (imageData) {
      const image = new Image();
      const canvas = document.querySelector('#board'); // FIXED selector
      const ctx = canvas.getContext('2d');
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = imageData;
    }
  }, [color]);

  const drawOnCanvas = () => {
    const canvas = document.querySelector('#board');
    const ctx = canvas.getContext('2d');

    const sketch = document.querySelector('#sketch'); // FIXED selector
    const sketchStyle = getComputedStyle(sketch);
    canvas.width = parseInt(sketchStyle.getPropertyValue('width'));
    canvas.height = parseInt(sketchStyle.getPropertyValue('height'));

    const mouse = { x: 0, y: 0 };
    const last_mouse = { x: 0, y: 0 };

    canvas.addEventListener(
      'mousemove',
      function (e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;
        mouse.x = e.pageX - canvas.offsetLeft;
        mouse.y = e.pageY - canvas.offsetTop;
      },
      false
    );

    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    canvas.addEventListener(
      'mousedown',
      () => {
        canvas.addEventListener('mousemove', onPaint, false);
      },
      false
    );

    canvas.addEventListener(
      'mouseup',
      () => {
        canvas.removeEventListener('mousemove', onPaint, false);
      },
      false
    );

    const onPaint = () => {
      ctx.beginPath();
      ctx.moveTo(last_mouse.x, last_mouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      if (timeout !== undefined) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        const base64Image = canvas.toDataURL('image/png');
        setImageData(base64Image);
      }, 1000);
    };
  };

  return (
    <div id="sketch" className="sketch">
      <canvas id="board" className="board" />
    </div>
  );
};

export default Board;
