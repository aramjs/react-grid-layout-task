import { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import GridLayout from 'react-grid-layout';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSet } from 'react-use';

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
  const onDragHandlerCountRef = useRef(0);
  const preventOnClickRef = useRef(false);

  const [, selectedItemsActions] = useSet<string>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<GridLayout.Layout[]>([]);
  const [zIndexMap, setZIndexMap] = useState<Record<string, number>>({});

  const [selectedItem, setSelectedItem] = useState<GridLayout.Layout | null>(null);

  const windowSize = useWindowSize();

  const styles = useGridLayoutContainerStyles();
  const menuStyles = useLayoutItemMenuStyles(mousePosition);

  // simulate receiving data from the server
  const { loading, error } = useGridLayoutData({
    onCompleted: response => {
      setLayout(response);
      setZIndexMap(response.reduce((acc, next, index) => ({ ...acc, [next.i]: 300 + index * 2 }), {}));
    },
  });

  const onContextMenu = useCallback((event: React.MouseEvent, item: GridLayout.Layout) => {
    event.preventDefault();
    setSelectedItem(item);
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  const onMenuSelect = useCallback(
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

      const selectedIndex = layout.findIndex(i => i.i === selectedItem.i);
      const elements = gridLayoutContainerRef.current.childNodes as unknown as HTMLDivElement[];

      const items = layout.filter((_, index) => {
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
    [layout, selectedItem]
  );

  const onItemSelect = useCallback(
    (event: React.MouseEvent, item: GridLayout.Layout) => {
      // prevent element selection because this function always fires after dropping
      if (preventOnClickRef.current) {
        preventOnClickRef.current = false;
        return;
      }

      if (event.shiftKey) {
        selectedItemsActions.toggle(item.i);
      }
    },
    [selectedItemsActions]
  );

  // PROBLEM: the onDrag handler sometimes fires once when the element is clicked.
  // there are two reasons for that.
  // the bug comes from the package
  // or a small cursor movement that will not be visible to the eye.
  // SOLUTION: if the onDrag handler has been called more than 1 time,
  // it means that drag is actually taking place
  const onDrag = useCallback<GridLayout.ItemCallback>(
    (layout, oldItem, newItem, placeholder, event) => {
      onDragHandlerCountRef.current += 1;

      const isDragging = onDragHandlerCountRef.current > 1;

      if (isDragging) {
        preventOnClickRef.current = true;

        if (event.shiftKey) {
          selectedItemsActions.add(newItem.i);
        } else {
          if (!selectedItemsActions.has(newItem.i)) {
            selectedItemsActions.reset();
            selectedItemsActions.add(newItem.i);
          }
        }
      }
    },
    [selectedItemsActions]
  );

  const onDragStop = useCallback<GridLayout.ItemCallback>(() => {
    const isDragging = onDragHandlerCountRef.current > 1;

    if (isDragging) {
      selectedItemsActions.reset();
    }

    onDragHandlerCountRef.current = 0;
  }, [selectedItemsActions]);

  if (error) return <h1>Error</h1>;
  if (loading || !layout) return <h1>Loading...</h1>;

  return (
    <>
      {Boolean(selectedItem) &&
        ReactDOM.createPortal(
          <OutsideClickHandler onOutsideClick={() => setSelectedItem(null)}>
            <div className={menuStyles.container}>
              <Select data={menuOptions} path="title" onSelect={onMenuSelect} />
            </div>
          </OutsideClickHandler>,
          document.body
        )}

      <h1 className={styles.header}>
        Press the <b>Shift</b> key for multiple selection
      </h1>

      <GridLayout
        key="GridLayout"
        allowOverlap
        useCSSTransforms
        className="layout"
        cols={12}
        containerPadding={[15, 15]}
        innerRef={gridLayoutContainerRef}
        layout={layout}
        rowHeight={30}
        width={windowSize.width}
        onDrag={onDrag}
        onDragStop={onDragStop}
        onLayoutChange={setLayout}
        onResize={setLayout}
      >
        {layout.map(item => {
          const isSelected = selectedItem?.i === item.i || selectedItemsActions.has(item.i);

          return (
            <div
              key={item.i}
              className={styles.content}
              style={{
                zIndex: zIndexMap[item.i],
                ...(isSelected && { backgroundColor: 'gray' }),
              }}
              onClick={event => onItemSelect(event, item)}
              onContextMenu={e => onContextMenu(e, item)}
            >
              {item.i}
            </div>
          );
        })}
      </GridLayout>
    </>
  );
}
