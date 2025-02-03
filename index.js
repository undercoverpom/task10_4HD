const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Set up logging
app.use(morgan('common'));

// Configure EJS templating
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from public_html
app.use(express.static('public_html'));
app.use('/js', express.static(path.join(__dirname, 'public_html/js')));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Helper function to get recommendations based on preferences
function getStyleBasedRecommendations(preferences) {
    const keywords = preferences.toLowerCase();
    let recommendations = [];

    // analyse style preferences
    const styleAnalysis = {
        category: determineCategory(preferences),
        keywords: findMatchedKeywords(preferences)
    };

    if (keywords.includes('sport') || keywords.includes('athletic') || keywords.includes('baseball')) {
        recommendations.push({
            name: 'Premium Baseball Cap',
            description: 'Perfect for sports and athletic activities with moisture-wicking fabric.',
            price: '$29.99',
            features: [
                'Moisture-wicking fabric',
                'Breathable mesh panels',
                'Adjustable closure',
                'UV protection'
            ]
        });
    }

    if (keywords.includes('casual') || keywords.includes('relaxed') || keywords.includes('everyday')) {
        recommendations.push({
            name: 'Classic Dad Hat',
            description: 'Comfortable, unstructured design perfect for everyday wear.',
            price: '$24.99',
            features: [
                'Soft cotton material',
                'Pre-curved brim',
                'Unstructured fit',
                'Adjustable strap'
            ]
        });
    }

    if (keywords.includes('street') || keywords.includes('urban') || keywords.includes('hip')) {
        recommendations.push({
            name: 'Snapback Cap',
            description: 'Modern street-style with adjustable fit and flat brim.',
            price: '$34.99',
            features: [
                'Flat brim design',
                'Snapback closure',
                'Structured crown',
                'Premium materials'
            ]
        });
    }

    if (keywords.includes('sun') || keywords.includes('protect') || keywords.includes('outdoor')) {
        recommendations.push({
            name: 'Wide Brim Sun Cap',
            description: 'Maximum sun protection with UPF 50+ fabric.',
            price: '$39.99',
            features: [
                'UPF 50+ protection',
                'Wide brim design',
                'Moisture-wicking sweatband',
                'Neck coverage'
            ]
        });
    }

    // Add default recommendations if no specific matches
    if (recommendations.length === 0) {
        recommendations = [
            {
                name: 'Classic Baseball Cap',
                description: 'Versatile design that works with any style.',
                price: '$24.99',
                features: [
                    'Classic 6-panel design',
                    'Cotton blend fabric',
                    'Adjustable back closure',
                    'Pre-curved brim'
                ]
            },
            {
                name: 'Adjustable Snapback',
                description: 'Modern look with custom fit.',
                price: '$29.99',
                features: [
                    'Snapback closure',
                    'Flat brim',
                    'Structured crown',
                    'One size fits most'
                ]
            },
            {
                name: 'Premium Dad Hat',
                description: 'Comfortable and casual everyday style.',
                price: '$19.99',
                features: [
                    'Relaxed fit',
                    'Soft cotton construction',
                    'Curved brim',
                    'Adjustable strap'
                ]
            }
        ];
    }

    return recommendations;
}

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'dKin Cap Style Assistant',
        message: 'Your personalised cap style recommendation system'
    });
});

// Handle text-based style preferences
app.post('/process-text', (req, res) => {
    const stylePreference = req.body.stylePreference;

    // Check if style preference was provided
    if (!stylePreference || stylePreference.trim().length === 0) {
        return res.render('recommendations', {
            title: 'Style Recommendations',
            error: 'Please provide some information about your style preferences.',
            recommendations: []
        });
    }

    // Get recommendations
    const recommendations = getStyleBasedRecommendations(stylePreference);

    // Render recommendations page with all data
    res.render('recommendations', {
        title: 'Your Cap Recommendations',
        recommendations: recommendationsWithAnalysis,
        userPreference: stylePreference,
        error: null
    });
});

// Helper function to find matched keywords
function findMatchedKeywords(preference) {
    const keywordSets = {
        athletic: ['sport', 'athletic', 'active', 'workout', 'baseball', 'running'],
        casual: ['casual', 'relaxed', 'everyday', 'comfortable', 'daily', 'basic'],
        fashion: ['style', 'fashion', 'trendy', 'modern', 'designer', 'unique'],
        outdoor: ['sun', 'protect', 'outdoor', 'hiking', 'beach', 'adventure']
    };

    const matchedWords = [];
    const prefLower = preference.toLowerCase();

    Object.entries(keywordSets).forEach(([category, words]) => {
        words.forEach(word => {
            if (prefLower.includes(word)) {
                matchedWords.push(word);
            }
        });
    });

    return matchedWords;
}

app.post('/process-face', (req, res) => {
    try {
        const faceAnalysis = JSON.parse(req.body.faceAnalysis);

        // Get recommendations based on face shape
        const recommendations = getCapRecommendations(faceAnalysis.shape).map(rec => ({
            ...rec,
            faceAnalysis: faceAnalysis, // Add face analysis to each recommendation
            optimalFeatures: getOptimalFeatures(faceAnalysis.shape), // Add optimal features
            textAnalysis: {
                category: 'Face Shape Analysis',
                keywords: [faceAnalysis.shape + ' face']
            }
        }));

        res.render('recommendations', {
            title: 'Your Cap Recommendations',
            recommendations: recommendations,
            userPreference: `Based on facial analysis (${faceAnalysis.shape} face shape)`,
            error: null
        });
    } catch (error) {
        console.error('Error processing face analysis:', error);
        res.render('recommendations', {
            title: 'Style Recommendations',
            error: 'Error processing face analysis data.',
            recommendations: []
        });
    }
});

function getCapRecommendations(faceShape) {
    const recommendations = {
        oval: [
            {
                name: 'Classic Baseball Cap',
                description: 'Perfect for oval faces with balanced proportions',
                price: '$29.99',
                features: [
                    'Medium crown height',
                    'Standard brim width',
                    'Classic 6-panel construction',
                    'Adjustable closure'
                ]
            },
            {
                name: 'Premium Fitted Cap',
                description: 'Showcases your well-proportioned features',
                price: '$34.99',
                features: [
                    'Structured crown',
                    'Pre-curved brim',
                    'Moisture-wicking band',
                    'Precise sizing'
                ]
            }
        ],
        round: [
            {
                name: 'Structured Snapback',
                description: 'Adds definition to softer features',
                price: '$32.99',
                features: [
                    'High crown profile',
                    'Flat brim',
                    'Angular panels',
                    'Snapback closure'
                ]
            },
            {
                name: 'Five Panel Cap',
                description: 'Creates length and balances roundness',
                price: '$27.99',
                features: [
                    'Streamlined design',
                    'Elongated crown',
                    'Lightweight construction',
                    'Athletic fit'
                ]
            }
        ],

    };

    return recommendations[faceShape] || recommendations.oval;
}

// Helper function to get optimal features based on face shape
function getOptimalFeatures(faceShape) {
    const features = {
        oval: [
            'Medium brim width',
            'Standard crown height',
            'Classic proportions',
            'Versatile fit'
        ],
        round: [
            'Structured crown',
            'Angular design elements',
            'Medium to high profile',
            'Forward tilted fit'
        ],
        square: [
            'Curved brim',
            'Soft fabric construction',
            'Relaxed profile',
            'Natural drape'
        ],
        oblong: [
            'Wide brim design',
            'Low profile crown',
            'Horizontal elements',
            'Balanced proportions'
        ]
    };

    return features[faceShape] || features.oval;
}

// Helper function to determine primary style category
function determineCategory(preference) {
    const keywords = preference.toLowerCase();
    if (keywords.includes('sport') || keywords.includes('athletic')) return 'Athletic';
    if (keywords.includes('casual') || keywords.includes('relaxed')) return 'Casual';
    if (keywords.includes('fashion') || keywords.includes('style')) return 'Fashion';
    return 'General';
}

// Error handling middleware
app.use((req, res) => {
    res.status(404);
    res.render('404', {
        title: '404: File Not Found',
        message: 'The requested page could not be found',
        url: req.url
    });
});

app.use((error, req, res, next) => {
    let errorStatus = error.status || 500;
    res.status(errorStatus);
    res.render('error', {
        title: `${errorStatus}: System Error`,
        message: 'An unexpected error occurred',
        error: error
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
    console.log('Press Ctrl+C to shut down the web server');
});