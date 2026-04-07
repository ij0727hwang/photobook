'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const STATUS_MAP = {
  20: { label: '결제완료', cls: 'badge-info' },
  25: { label: 'PDF 준비', cls: 'badge-info' },
  30: { label: '제작확정', cls: 'badge-warning' },
  40: { label: '제작중', cls: 'badge-warning' },
  45: { label: '제작완료', cls: 'badge-success' },
  50: { label: '제작완료', cls: 'badge-success' },
  60: { label: '배송중', cls: 'badge-info' },
  70: { label: '배송완료', cls: 'badge-success' },
  80: { label: '취소', cls: 'badge-error' },
  81: { label: '취소/환불', cls: 'badge-error' },
  90: { label: '오류', cls: 'badge-error' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/orders?limit=50');
        const data = await res.json();
        if (data.success && data.data?.items) {
          setOrders(data.data.items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.ordersPage}>
        <div className="container-narrow">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>주문 내역을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ordersPage}>
      <div className="container-narrow">
        <div className={styles.header}>
          <h1 className="page-title">주문 내역</h1>
          <p className="page-subtitle">포토북 주문 이력을 확인하세요.</p>
        </div>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyText}>아직 주문 내역이 없습니다.</p>
            <Link href="/create" className="btn btn-primary">
              첫 포토북 만들기 →
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => {
              const status = STATUS_MAP[order.orderStatus] || { label: order.orderStatusDisplay || '알 수 없음', cls: 'badge-info' };
              return (
                <Link
                  key={order.orderUid}
                  href={`/orders/${order.orderUid}`}
                  className={styles.orderCard}
                >
                  <div className={styles.orderInfo}>
                    <div className={styles.orderUid}>{order.orderUid}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.orderedAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                    <div className={styles.orderAmount}>
                      {(order.totalAmount || 0).toLocaleString()}원
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
