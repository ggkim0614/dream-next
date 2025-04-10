'use client';

import React, { useState, useEffect, useRef } from 'react';
import StormClouds from './components/StormClouds';
import StormCloudsVariation1 from './components/StormCloudsVariation1';
import StormCloudsVariation2 from './components/StormCloudsVariation2';

export default function Home() {
	const [activeTab, setActiveTab] = useState(0);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [isFlickering, setIsFlickering] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [transitionText, setTransitionText] = useState('');
	const [transitionSubtitle, setTransitionSubtitle] = useState('');
	const audioRefs = useRef<HTMLAudioElement[]>([]);
	const flickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		// Set initial dimensions
		updateDimensions();

		// Add event listener for window resize
		window.addEventListener('resize', updateDimensions);

		// Initialize audio for each tab
		const sounds = [
			'/audio/seatbelt-ding.mp3',
			'/audio/cabin-ambience-1.mp3',
			'/audio/cabin-ambience-2.mp3',
			'/audio/cabin-ambience-3.mp3',
		];

		audioRefs.current = sounds.map((sound) => {
			const audio = new Audio(sound);
			audio.volume = 0.3; // Set volume to 30%
			return audio;
		});

		// Play the initial ambient sound
		if (audioRefs.current[1]) {
			audioRefs.current[1].play();
		}

		// Enhanced flickering effect
		const startFlickering = () => {
			const flickerType = Math.random();

			if (flickerType < 0.3) {
				// Quick consecutive flickers (2-4 times)
				const flickerCount = Math.floor(Math.random() * 3) + 2;
				let currentFlicker = 0;

				const quickFlicker = () => {
					setIsFlickering(true);
					setTimeout(() => {
						setIsFlickering(false);
						currentFlicker++;

						if (currentFlicker < flickerCount) {
							setTimeout(quickFlicker, Math.random() * 200 + 100); // 100-300ms between quick flickers
						} else {
							// Schedule next flicker pattern
							setTimeout(startFlickering, Math.random() * 2000 + 1000);
						}
					}, Math.random() * 150 + 100); // 100-250ms flicker duration
				};

				quickFlicker();
			} else if (flickerType < 0.5) {
				// Longer single flicker
				setIsFlickering(true);
				setTimeout(() => {
					setIsFlickering(false);
					// Schedule next flicker pattern
					setTimeout(startFlickering, Math.random() * 2000 + 1000);
				}, Math.random() * 300 + 200); // 200-500ms flicker duration
			} else {
				// Normal single flicker
				setIsFlickering(true);
				setTimeout(() => {
					setIsFlickering(false);
					// Schedule next flicker pattern
					setTimeout(startFlickering, Math.random() * 2000 + 1000);
				}, Math.random() * 150 + 100); // 100-250ms flicker duration
			}
		};

		startFlickering();

		// Cleanup
		return () => {
			window.removeEventListener('resize', updateDimensions);
			audioRefs.current.forEach((audio) => {
				audio.pause();
				audio.currentTime = 0;
			});
			audioRefs.current = [];
			if (flickerTimeoutRef.current) {
				clearTimeout(flickerTimeoutRef.current);
			}
		};
	}, []);

	const handleTabChange = (index: number) => {
		setIsTransitioning(true);
		setTransitionText(`TO ${tabs[index].name}`);

		// Set the appropriate subtitle based on the tab
		const subtitles = {
			0: 'young, naive',
			1: 'uncertain, full of anticipation',
			2: 'second home, familiar',
		};
		setTransitionSubtitle(subtitles[index as keyof typeof subtitles]);

		// Stop all currently playing sounds
		audioRefs.current.forEach((audio) => {
			audio.pause();
			audio.currentTime = 0;
		});

		// Play the transition sound (seatbelt ding)
		if (audioRefs.current[0]) {
			audioRefs.current[0].currentTime = 0;
			audioRefs.current[0].play();
		}

		setTimeout(() => {
			setActiveTab(index);
			// Play the ambient sound for the new tab
			if (audioRefs.current[index + 1]) {
				audioRefs.current[index + 1].currentTime = 0;
				audioRefs.current[index + 1].play();
			}
			setTimeout(() => {
				setIsTransitioning(false);
				setTransitionText('');
				setTransitionSubtitle('');
			}, 300);
		}, 300);
	};

	const tabs = [
		{ name: 'JFK', component: StormClouds },
		{ name: 'SFO', component: StormCloudsVariation1 },
		{ name: 'LAX', component: StormCloudsVariation2 },
	];

	const ActiveComponent = tabs[activeTab].component;

	return (
		<main className="min-h-screen bg-black">
			<nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div
							className="text-white [font-family:var(--font-jetbrains-mono)] [text-transform:uppercase] text-sm relative pointer-events-auto"
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							DREAMS
							<span
								className={`absolute left-0 top-full mt-1 text-white [font-family:var(--font-jetbrains-mono)] [text-transform:lowercase] transition-opacity duration-300 ${
									isHovered ? 'opacity-60' : 'opacity-0'
								}`}
							>
								IN THE CLOUDS
							</span>
						</div>
						<div className="flex items-center">
							<div className="flex space-x-4">
								{tabs.map((tab, index) => (
									<button
										key={index}
										onClick={() => handleTabChange(index)}
										className={`px-3 py-2 rounded-md text-sm [font-family:var(--font-jetbrains-mono)] pointer-events-auto transition-all duration-300 ${
											activeTab === index
												? 'text-white [text-transform:uppercase]'
												: 'text-gray-400 hover:text-white [text-transform:lowercase]'
										}`}
									>
										{tab.name}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</nav>

			<div className="h-screen relative">
				{dimensions.width > 0 && dimensions.height > 0 && (
					<div
						className={`transition-all duration-300 ${
							isTransitioning || isFlickering
								? 'opacity-0 blur-sm'
								: 'opacity-100 blur-none'
						}`}
					>
						<ActiveComponent
							width={dimensions.width}
							height={dimensions.height}
							flowSpeed={0.2}
						/>
					</div>
				)}

				{/* Transition Text */}
				<div
					className={`fixed inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
						isTransitioning ? 'opacity-100' : 'opacity-0'
					}`}
				>
					<div className="text-white [font-family:var(--font-jetbrains-mono)] [text-transform:uppercase] text-md tracking-wider">
						{transitionText}
					</div>
					<div className="text-white [font-family:var(--font-jetbrains-mono)] [text-transform:lowercase] text-md tracking-wider opacity-50 mt-2">
						{transitionSubtitle}
					</div>
				</div>
			</div>

			<footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none opacity-60">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="text-white [font-family:var(--font-jetbrains-mono)] [text-transform:uppercase] text-sm">
							Neuroscience of Imaginations, 25 SP
						</div>
						<div className="text-white [font-family:var(--font-jetbrains-mono)] [text-transform:uppercase] text-sm">
							©George Kim, 2025
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
