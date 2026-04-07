import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'MyPhotoBook — 나만의 포토북을 만들어보세요',
  description: '사진을 업로드하면 아름다운 포토북으로 만들어드립니다. 여행, 일상, 가족 사진을 감성 포토북으로.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
