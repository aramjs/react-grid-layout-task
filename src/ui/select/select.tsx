import { useSelectStyles } from './select.styles';

type Option = { id: string };

type SelectProps<T extends Option> = {
  data: ReadonlyArray<T>;
  path: KeysWithValueType<T, string>;
  onSelect(item: T, e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
};

export function Select<const T extends Option>({ data, path, onSelect }: SelectProps<T>) {
  const styles = useSelectStyles();

  return (
    <div className={styles.container}>
      {data.map(item => (
        <div
          key={item.id}
          className={styles.row}
          onClick={e => {
            e.stopPropagation();
            onSelect(item, e);
          }}
        >
          {item[path] as string}
        </div>
      ))}
    </div>
  );
}
