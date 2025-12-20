export const formatDateTime = (dateInput: Date | string): string => {
  const date =
    typeof dateInput === "string"
      ? new Date(dateInput)
      : dateInput;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
