'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const STATUS_TIMELINE = [
  { code: 20, label: '결제 완료', desc: '충전금이 차감되었습니다.' },
  { code: 25, label: 'PDF 생성', desc: '인쇄용 PDF가 생성되었습니다.' },
  { code: 30, label: '제작 확정', desc: '제작이 확인되었습니다.' },
  { code: 40, label: '제작 진행', desc: '인쇄 제작 중입니다.' },
  { code: 50, label: '제작 완료', desc: '제작이 완료되었습니다.' },
  { code: 60, label: '배송 출발', desc: '택배사에 인계되었습니다.' },
  { code: 70, label: '배송 완료', desc: '배송이 완료되었습니다.' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const { orderUid } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderUid}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderUid]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderUid}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(prev => ({ ...prev, orderStatus: 81, orderStatusDisplay: '취소/환불' }));
        setShowCancel(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className="container-narrow">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>주문 정보를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.detailPage}>
        <div className="container-narrow">
          <p>주문을 찾을 수 없습니다.</p>
          <Link href="/orders" className="btn btn-secondary" style={{ marginTop: 16 }}>
            ← 주문 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[order.orderStatus] || { label: order.orderStatusDisplay || '알 수 없음', cls: 'badge-info' };
  const canCancel = order.orderStatus === 20 || order.orderStatus === 25;

  return (
    <div className={styles.detailPage}>
      <div className="container-narrow">
        <Link href="/orders" className={styles.backLink}>
          ← 주문 목록으로
        </Link>

        <div className={styles.titleRow}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.8rem' }}>주문 상세</h1>
            <p className="page-subtitle">{order.orderUid}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className={`badge ${status.cls}`}>{status.label}</span>
            {canCancel && (
              <button className="btn btn-danger btn-sm" onClick={() => setShowCancel(true)}>
                주문 취소
              </button>
            )}
          </div>
        </div>

        <div className={styles.grid}>
          {/* Order Info */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>📋 주문 정보</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>주문 번호</span>
              <span className={styles.infoValue}>{order.orderUid}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>주문일시</span>
              <span className={styles.infoValue}>{new Date(order.orderedAt).toLocaleString('ko-KR')}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>상품 금액</span>
              <span className={styles.infoValue}>{(order.totalProductAmount || 0).toLocaleString()}원</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>배송비</span>
              <span className={styles.infoValue}>{(order.totalShippingFee || 0).toLocaleString()}원</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>총 결제 금액</span>
              <span className={styles.infoValue} style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                {(order.paidCreditAmount || order.totalAmount || 0).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>🚚 배송 정보</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>수령인</span>
              <span className={styles.infoValue}>{order.recipientName || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>연락처</span>
              <span className={styles.infoValue}>{order.recipientPhone || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>주소</span>
              <span className={styles.infoValue}>
                {order.address1 || '-'} {order.address2 || ''}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>우편번호</span>
              <span className={styles.infoValue}>{order.postalCode || '-'}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>
          <div className={styles.panelTitle}>📍 진행 상태</div>
          <div className={styles.timelineSteps}>
            {STATUS_TIMELINE.map((st) => {
              const isDone = order.orderStatus > st.code;
              const isActive = order.orderStatus === st.code;
              return (
                <div key={st.code} className={styles.timelineStep}>
                  <div className={`${styles.timelineDot} ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`} />
                  <div>
                    <div className={styles.timelineLabel} style={{ opacity: isDone || isActive ? 1 : 0.4 }}>
                      {st.label}
                    </div>
                    <div className={styles.timelineDesc} style={{ opacity: isDone || isActive ? 1 : 0.3 }}>
                      {st.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className={styles.items}>
            <h3 style={{ marginBottom: 16, fontWeight: 600 }}>📚 주문 항목</h3>
            {order.items.map((item) => (
              <div key={item.itemUid} className={styles.itemCard}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTitle}>{item.bookTitle || item.bookUid}</div>
                  <div className={styles.itemMeta}>
                    수량: {item.quantity} · 페이지: {item.pageCount || '-'}p
                  </div>
                </div>
                <div className={styles.itemAmount}>
                  {(item.itemAmount || 0).toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className={styles.cancelModal} onClick={() => setShowCancel(false)}>
          <div className={styles.cancelBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cancelTitle}>주문을 취소하시겠습니까?</div>
            <div className="input-group">
              <label>취소 사유</label>
              <input
                className="input"
                placeholder="취소 사유를 입력하세요"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className={styles.cancelBtns}>
              <button className="btn btn-secondary" onClick={() => setShowCancel(false)} style={{ flex: 1 }}>
                아니요
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={cancelling || !cancelReason.trim()}
                style={{ flex: 1 }}
              >
                {cancelling ? '취소 중...' : '주문 취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
