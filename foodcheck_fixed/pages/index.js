import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [quantity, setQuantity] = useState(1);

  const dummyResults = [
    { store: '쿠팡', price: 34800, shipping: 0, eta: '내일 도착', perUnit: 870 },
    { store: '트레이더스', price: 31200, shipping: 0, eta: '3일 후', perUnit: 780 },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>푸드체크 (FoodCheck)</h1>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="상품명" />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <div style={{ marginTop: '1rem' }}>
        {dummyResults.map((item, i) => (
          <div key={i} style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem 0' }}>
            <strong>{item.store}</strong>
            <div>총 가격: {item.price.toLocaleString()}원</div>
            <div>단가: {item.perUnit.toLocaleString()}원 / 개</div>
            <div>예상 도착: {item.eta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}