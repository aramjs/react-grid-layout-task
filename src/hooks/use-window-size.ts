import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleWindowResize = () => setSize({ height: window.innerHeight, width: window.innerWidth });

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return size;
}
