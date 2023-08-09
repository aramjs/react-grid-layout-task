export function isElementPartiallyInAnotherElement(element: HTMLDivElement, container: HTMLDivElement) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const isPartiallyVisible =
    elementRect.top < containerRect.bottom &&
    elementRect.bottom > containerRect.top &&
    elementRect.left < containerRect.right &&
    elementRect.right > containerRect.left;

  return isPartiallyVisible;
}

export function findNearestNumber(target: number, numbersArray: number[]) {
  let nearestNumber = target;
  let minDifference = Infinity;

  for (const number of numbersArray) {
    const difference = Math.abs(target - number);

    if (difference < minDifference) {
      minDifference = difference;
      nearestNumber = number;
    }
  }

  return nearestNumber || 0;
}
