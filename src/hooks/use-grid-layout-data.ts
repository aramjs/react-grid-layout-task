import { useCallback } from 'react';
import { useAsync } from 'react-use';
import ReactGridLayout from 'react-grid-layout';

const MOCK_LAYOUT_DATA: ReactGridLayout.Layout[] = [
  { i: '0', x: 0, y: 0, w: 2, h: 4 },
  { i: '1', x: 2, y: 0, w: 2, h: 3 },
  { i: '2', x: 4, y: 0, w: 2, h: 3 },
  { i: '3', x: 6, y: 0, w: 2, h: 5 },
  { i: '4', x: 8, y: 0, w: 2, h: 5 },
  { i: '5', x: 10, y: 0, w: 2, h: 3 },
  { i: '6', x: 0, y: 3, w: 2, h: 3 },
  { i: '7', x: 2, y: 5, w: 2, h: 5 },
  { i: '8', x: 4, y: 2, w: 2, h: 2 },
  { i: '9', x: 6, y: 4, w: 2, h: 4 },
  { i: '10', x: 8, y: 2, w: 2, h: 2 },
  { i: '11', x: 10, y: 5, w: 2, h: 5 },
  { i: '12', x: 0, y: 4, w: 2, h: 2 },
  { i: '13', x: 2, y: 8, w: 2, h: 4 },
  { i: '14', x: 4, y: 4, w: 2, h: 2 },
  { i: '15', x: 6, y: 10, w: 2, h: 5 },
  { i: '16', x: 8, y: 8, w: 2, h: 4 },
  { i: '17', x: 10, y: 10, w: 2, h: 5 },
  { i: '18', x: 0, y: 9, w: 2, h: 3 },
  { i: '19', x: 2, y: 6, w: 2, h: 2 },
];

type UseGridLayoutDataProps = {
  onCompleted?(data: ReactGridLayout.Layout[]): void;
};

export function useGridLayoutData({ onCompleted }: UseGridLayoutDataProps) {
  const fetchFn = useCallback(async () => {
    const data = await new Promise<ReactGridLayout.Layout[]>(r => setTimeout(() => r(MOCK_LAYOUT_DATA), 300));

    onCompleted?.(data);

    return data;
  }, [onCompleted]);

  return useAsync(fetchFn);
}
