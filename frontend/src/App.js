import React, { useState, useEffect, Suspense, lazy, memo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './providers/firebase';
import { AppProvider, useUser } from './contexts/AppContext';
import firebaseService from './services/firebaseService';

// Lazy load components with error handling and retry
const Auth = lazy(() => import('./components/Auth'));
const StartupDashboard = lazy(() => import('./components/StartupDashboard'));
const InvestorDashboard = lazy(() => import('./components/InvestorDashboard'));
const StartupsPage = lazy(() => import('./components/StartupsPage'));
const InvestorsPage = lazy(() => import('./components/InvestorsPage'));
const StartupDetailView = lazy(() => import('./components/StartupDetailView'));
const InvestorDetailView = lazy(() => import('./components/InvestorDetailView'));
const ProfileSettings = lazy(() => import('./components/ProfileSettings'));
const AboutPage = lazy(() => import('./components/AboutPage'));

// Keep lightweight components as regular imports
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';
import LazyWrapper from './components/LazyWrapper';

// Wrapper component to fetch startup data by ID
const StartupDetailViewWrapper = memo(({ onBack, user, userType }) => {
	const { id } = useParams();
	const [startup, setStartup] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchStartup = async () => {
			try {
				setLoading(true);
				setError(null);
				
				// Try to get startup by ID from Firestore
				const startupData = await firebaseService.getStartup(id);
				if (startupData) {
					setStartup(startupData);
				} else {
					// Fallback to demo data if not found
					setStartup({
						id: id,
						companyName: 'Demo Startup',
						description: 'This is a demo startup. Real data will be loaded when available.',
						industry: 'Technology',
						stage: 'Series A',
						teamSize: '25-50',
						foundedYear: '2021',
						overallScore: 85,
						website: 'https://demo.com',
						email: 'contact@demo.com',
						phone: '+1 (555) 123-4567',
						location: 'San Francisco, CA'
					});
				}
			} catch (err) {
				console.error('Error fetching startup:', err);
				setError('Failed to load startup data');
				// Fallback to demo data
				setStartup({
					id: id,
					companyName: 'Demo Startup',
					description: 'This is a demo startup. Real data will be loaded when available.',
					industry: 'Technology',
					stage: 'Series A',
					teamSize: '25-50',
					foundedYear: '2021',
					overallScore: 85,
					website: 'https://demo.com',
					email: 'contact@demo.com',
					phone: '+1 (555) 123-4567',
					location: 'San Francisco, CA'
				});
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchStartup();
		}
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
					<p className="text-gray-600 text-lg font-medium">Loading startup details...</p>
				</div>
			</div>
		);
	}

	if (error && !startup) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">Startup Not Found</h1>
					<p className="text-gray-600 mb-6">The startup you're looking for doesn't exist or has been removed.</p>
					<button
						onClick={onBack}
						className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	return <StartupDetailView startup={startup} onBack={onBack} user={user} userType={userType} />;
});

// Memoized AppContent component for better performance
const AppContent = memo(() => {
	const { user, userType, loading, setUser, setUserType, clearUser } = useUser();
	const navigate = useNavigate();
	const location = useLocation();

	// Throttled auth state change handler
	const handleAuthStateChange = useCallback(async (user) => {
		setUser(user);
		if (user) {
			// Get user type from localStorage or user metadata
			const storedUserType = localStorage.getItem('userType');
			setUserType(storedUserType);
		} else {
			// Clear user type and profile when not logged in
			setUserType(null);
			clearUser();
		}
	}, [setUser, setUserType, clearUser]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
		return () => unsubscribe();
	}, [handleAuthStateChange]);

	const handleAuthSuccess = useCallback((user, type, additionalData = {}) => {
		setUser(user);
		setUserType(type);
		localStorage.setItem('userType', type);
		
		// Store additional user data in Firebase if provided
		if (additionalData.companyName || additionalData.fullName) {
			// This would be handled by the Firebase service
		}
		
		// Redirect based on user type
		if (type === 'startup') {
			navigate('/startup-dashboard');
		} else if (type === 'investor') {
			navigate('/investor-dashboard');
		}
	}, [setUser, setUserType, navigate]);

	// FIXED: Calls firebaseService.signOutUser() to perform the actual logout
	const handleLogout = useCallback(async () => {
		try {
			// 1. Call the Firebase service wrapper to sign the user out
			await firebaseService.signOutUser(); 
			
			// 2. Clean up local state/storage after successful sign-out
			localStorage.removeItem('userType');
			
			// Note: The onAuthStateChanged listener handles clearUser() and state update.
			
			// 3. Navigate away from the authenticated view
			navigate('/');
		} catch (error) {
			console.error("Error signing out via firebaseService:", error);
			// Optionally display an error notification here
		}
	}, [navigate]);

	const handleStartupSelect = useCallback((startup) => {
		navigate(`/startup/${startup.id}`);
	}, [navigate]);

	const handleInvestorSelect = (investor) => {
		navigate(`/investor/${investor.id}`);
	};

	const handleBackToDashboard = () => {
		if (userType === 'investor') {
			navigate('/investor-dashboard');
		} else {
			navigate('/startup-dashboard');
		}
	};

	const handleLogin = () => {
		navigate('/auth');
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
				<LoadingSpinner size="xl" text="Loading application..." />
			</div>
		);
	}

	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
				<LoadingSpinner size="xl" text="Loading application..." />
			</div>
		}>
			<Routes>
				<Route path="/auth" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
			
			<Route path="/startup-dashboard" element={
				user && userType === 'startup' ? (
					<div>
						<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="dashboard" />
						<StartupDashboard user={user} onLogout={handleLogout} />
					</div>
				) : (
					<Navigate to="/auth" replace />
				)
			} />
			
			<Route path="/investor-dashboard" element={
				user && userType === 'investor' ? (
					<div>
						<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="dashboard" />
						<InvestorDashboard user={user} onLogout={handleLogout} />
					</div>
				) : (
					<Navigate to="/auth" replace />
				)
			} />
			
			<Route path="/startups" element={
				<div>
					<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="startups" />
					<StartupsPage 
						user={user} 
						userType={userType}
						onLogout={handleLogout}
						onStartupSelect={handleStartupSelect}
					/>
				</div>
			} />

			<Route path="/investors" element={
				<div>
					<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="investors" />
					<InvestorsPage 
						user={user} 
						userType={userType}
						onLogout={handleLogout}
						onInvestorSelect={handleInvestorSelect}
					/>
				</div>
			} />
			
			<Route path="/startup/:id" element={
				<StartupDetailViewWrapper 
					onBack={handleBackToDashboard}
					user={user}
					userType={userType}
				/>
			} />
			
			<Route path="/investor/:id" element={
				<InvestorDetailView 
					investor={{
						id: '1',
						firmName: 'Venture Capital Partners',
						investorType: 'VC',
						focusIndustries: ['Technology', 'Healthcare', 'Fintech'],
						investmentStages: ['Seed', 'Series A', 'Series B'],
						checkSizeRange: '$500K' - '$5M',
						geographicFocus: ['North America', 'Europe'],
						portfolioSize: '50+',
						investmentThesis: 'We invest in early-stage companies with disruptive technology and strong founding teams.',
						yearsExperience: '15+',
						website: 'https://vcp.com',
						linkedin: 'https://linkedin.com/company/vcp',
						twitter: '@VCPartners',
						teamBackground: 'Former entrepreneurs and operators with deep industry expertise',
						previousNotableInvestments: 'Uber, Airbnb, Stripe, Zoom'
					}}
					onBack={handleBackToDashboard}
				/>
			} />
			
			<Route path="/about" element={
				<div>
					<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="about" />
					<AboutPage />
				</div>
			} />
			
			<Route path="/contact" element={
				<div>
					<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="contact" />
					<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
							<p className="text-gray-600">Coming soon...</p>
						</div>
					</div>
				</div>
			} />
			
			<Route path="/resources" element={
				<div>
					<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="resources" />
					<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900 mb-4">Resources</h1>
							<p className="text-gray-600">Coming soon...</p>
						</div>
					</div>
				</div>
			} />
			
			<Route path="/profile" element={
				user ? (
					<div>
						<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="profile" />
						<ProfileSettings 
							user={user} 
							userType={userType} 
							onBack={() => navigate(userType === 'startup' ? '/startup-dashboard' : '/investor-dashboard')}
						/>
					</div>
				) : (
					<Navigate to="/auth" replace />
				)
			} />
			
			<Route path="/meetings" element={
				user ? (
					<div>
						<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="meetings" />
						<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
							<div className="text-center">
								<h1 className="text-4xl font-bold text-gray-900 mb-4">Meetings</h1>
								<p className="text-gray-600">Coming soon...</p>
							</div>
						</div>
					</div>
				) : (
					<Navigate to="/auth" replace />
				)
			} />
			
			<Route path="/messages" element={
				user ? (
					<div>
						<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="messages" />
						<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
							<div className="text-center">
								<h1 className="text-4xl font-bold text-gray-900 mb-4">Messages</h1>
								<p className="text-gray-600">Coming soon...</p>
							</div>
						</div>
					</div>
				) : (
					<Navigate to="/auth" replace />
				)
			} />
			
			{/* Default route - Home page */}
			<Route path="/" element={
				<div>
					<Navbar user={user} userType={userType} onLogout={handleLogout} currentPage="home" />
					<HomePage 
						user={user} 
						userType={userType} 
						onLogin={handleLogin}
						onStartupSelect={handleStartupSelect}
					/>
				</div>
			} />
			</Routes>
		</Suspense>
	);
});

function App() {
	// Register service worker for caching
	useEffect(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js')
				.then((registration) => {
					console.log('SW registered: ', registration);
				})
				.catch((registrationError) => {
					console.log('SW registration failed: ', registrationError);
				});
		}
	}, []);

	return (
		<ErrorBoundary>
			<AppProvider>
				<Router future={{ v7_relativeSplatPath: true }}>
					<AppContent />
				</Router>
			</AppProvider>
		</ErrorBoundary>
	);
}

export default App;
