export default function toLocalIsoString(date) {
  if (!date) return null;
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num) => (num < 10 ? '0' : '') + num;
  return `${date.getFullYear()
  }-${pad(date.getMonth() + 1)
  }-${pad(date.getDate())
  }T${pad(date.getHours())
  }:${pad(date.getMinutes())
  }:${pad(date.getSeconds())
  }${dif}${pad(Math.floor(Math.abs(tzo) / 60))
  }:${pad(Math.abs(tzo) % 60)}`;
}
