import { ForwardedRef, ReactNode, forwardRef, memo, useCallback } from 'react';
import GridLayout from 'react-grid-layout';

import { useGridLayoutRowStyles } from './grid-layout-row.styles';
import classNames from 'classnames';

type GridLayoutRowProps = {
  isSelected: boolean;
  children?: ReactNode;
  style?: React.CSSProperties;
  zIndex: number;
  className?: string;
  item: GridLayout.Layout;
  onClick?(event: React.MouseEvent): void;
  onOpenContextMenu(event: React.MouseEvent, item: GridLayout.Layout): void;
  onSelectItem(event: React.MouseEvent, item: GridLayout.Layout): void;
};

export const GridLayoutRowForwarded = forwardRef(
  (
    {
      item,
      isSelected,
      zIndex,
      style,
      children,
      onClick: _onClick,
      onSelectItem,
      onOpenContextMenu,
      className,
      ...props
    }: GridLayoutRowProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const styles = useGridLayoutRowStyles({ isSelected, zIndex });

    const onClick = useCallback(
      (event: React.MouseEvent) => {
        onSelectItem(event, item);
        _onClick?.(event);
      },
      [_onClick, item, onSelectItem]
    );
    const onContextMenu = useCallback(
      (event: React.MouseEvent) => onOpenContextMenu(event, item),
      [item, onOpenContextMenu]
    );

    return (
      <div
        key={item.i}
        ref={ref}
        className={classNames(className, styles.container)}
        style={style}
        onClick={onClick}
        onContextMenu={onContextMenu}
        {...props}
      >
        {item.i}

        {children}
      </div>
    );
  }
);

export const GridLayoutRow = memo(GridLayoutRowForwarded);
