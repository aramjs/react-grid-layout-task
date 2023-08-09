import { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import GridLayout from 'react-grid-layout';
import OutsideClickHandler from 'react-outside-click-handler';

import min from 'lodash/min';
import max from 'lodash/max';
import values from 'lodash/values';

import { useGridLayoutData, useWindowSize } from '../../hooks';
import { Select } from '../../ui';

import { useLayoutItemMenuStyles, useGridLayoutContainerStyles } from './grid-layout-container.styles';
import { findNearestNumber, isElementPartiallyInAnotherElement } from '../../helpers';

const menuOptions = [
  { id: 'front', title: 'Send to front' },
  { id: 'back', title: 'Send to back' },
  { id: 'front1Step', title: 'Send to front by 1 step' },
  { id: 'back1Step', title: 'Send to back by 1 step' },
] as const;

export function ReactGridLayoutContainer() {
  const gridLayoutContainerRef = useRef<HTMLDivElement | null>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [data, setData] = useState<GridLayout.Layout[]>([]);
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>({});

  const [selectedItem, setSelectedItem] = useState<GridLayout.Layout | null>(null);

  const windowSize = useWindowSize();

  const styles = useGridLayoutContainerStyles();
  const menuStyles = useLayoutItemMenuStyles(mousePosition);

  // simulate receiving data from the server
  const { loading, error } = useGridLayoutData({
    onCompleted: response => {
      setData(response);
      setZIndexMap(response.reduce((acc, next, index) => ({ ...acc, [next.i]: 300 + index * 2 }), {}));
    },
  });

  const onContextMenu = useCallback((event: React.MouseEvent, item: GridLayout.Layout) => {
    event.preventDefault();
    setSelectedItem(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  const onSelect = useCallback(
    (selectedOption: (typeof menuOptions)[number]) => {
      if (!selectedItem || !gridLayoutContainerRef.current) return;

      const calcZIndex = (n = 0, diff: -1 | 1) => {
        if (n + diff < 0) return 0;
        return n + diff;
      };

      if (selectedOption.id === 'back') {
        return setZIndexMap(prev => {
          const currentZIndex = prev[selectedItem.i];
          const zIndexMin = min(values(prev));
          const isSameZIndex = currentZIndex === zIndexMin;
          return { ...prev, [selectedItem.i]: isSameZIndex ? currentZIndex : calcZIndex(zIndexMin, -1) };
        });
      }

      if (selectedOption.id === 'front') {
        return setZIndexMap(prev => {
          const currentZIndex = prev[selectedItem.i];
          const zIndexMax = max(values(prev));
          const isSameZIndex = currentZIndex === zIndexMax;
          return { ...prev, [selectedItem.i]: isSameZIndex ? currentZIndex : calcZIndex(zIndexMax, 1) };
        });
      }

      const selectedIndex = data.findIndex(i => i.i === selectedItem.i);
      const elements = gridLayoutContainerRef.current.childNodes as unknown as HTMLDivElement[];

      const items = data.filter((_, index) => {
        if (index === selectedIndex) return false;
        return isElementPartiallyInAnotherElement(elements[selectedIndex], elements[index]);
      });

      if (selectedOption.id === 'back1Step') {
        return setZIndexMap(prev => {
          const currentZIndex = prev[selectedItem.i];
          const nearestNumber = findNearestNumber(
            currentZIndex,
            items.map(item => prev[item.i]).filter(i => i < currentZIndex)
          );
          const isSameZIndex = currentZIndex === nearestNumber;

          return {
            ...prev,
            [selectedItem.i]: isSameZIndex ? currentZIndex : calcZIndex(nearestNumber, -1),
          };
        });
      }

      if (selectedOption.id === 'front1Step') {
        return setZIndexMap(prev => {
          const currentZIndex = prev[selectedItem.i];
          const nearestNumber = findNearestNumber(
            currentZIndex,
            items.map(item => prev[item.i]).filter(i => i > currentZIndex)
          );
          const isSameZIndex = currentZIndex === nearestNumber;

          return {
            ...prev,
            [selectedItem.i]: isSameZIndex ? currentZIndex : calcZIndex(nearestNumber, 1),
          };
        });
      }
    },
    [data, selectedItem]
  );

  if (error) return <h1>Error</h1>;
  if (loading || !data) return <h1>Loading...</h1>;

  return (
    <>
      {Boolean(selectedItem) &&
        ReactDOM.createPortal(
          <OutsideClickHandler onOutsideClick={() => setSelectedItem(null)}>
            <div className={menuStyles.container}>
              <Select data={menuOptions} path="title" onSelect={onSelect} />
            </div>
          </OutsideClickHandler>,
          document.body
        )}

      <GridLayout
        key="GridLayout"
        allowOverlap
        useCSSTransforms
        className="layout"
        cols={12}
        containerPadding={[15, 15]}
        innerRef={gridLayoutContainerRef}
        layout={data}
        rowHeight={30}
        width={windowSize.width}
        onLayoutChange={setData}
        onResize={setData}
      >
        {data.map(item => (
          <div
            key={item.i}
            className={styles.container}
            style={{
              zIndex: zIndexMap[item.i],
              ...(selectedItem?.i === item.i && { backgroundColor: 'gray' }),
            }}
            onContextMenu={e => onContextMenu(e, item)}
          >
            {item.i}
          </div>
        ))}
      </GridLayout>
    </>
  );
}
