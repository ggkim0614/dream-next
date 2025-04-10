import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
	title: 'Shader Clouds',
	description: 'Interactive shader clouds visualization',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} ${jetbrainsMono.variable}`}>
				{children}
			</body>
		</html>
	);
}
