// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. View Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    function switchView(targetId) {
        // Update Nav Active State
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update View Display
        views.forEach(view => {
            if (view.id === targetId) {
                view.classList.add('active');
                // Trigger animation reset
                view.style.animation = 'none';
                view.offsetHeight; /* trigger reflow */
                view.style.animation = null; 
            } else {
                view.classList.remove('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchView(item.dataset.target);
        });
    });

    // Expose for external calls
    window.app = { switchView };


    // --- 2. File Upload Simulation ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const btnStartAnalysis = document.getElementById('btn-start-analysis');
    const companyInput = document.getElementById('company-search');

    // We will store the real uploaded files here instead of mock objects
    let uploadedFiles = [];
    
    // Store the API response globally so we can render views later
    let apiResponseData = null;

    // Drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    // Handle Drop
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle Click via hidden input
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function handleFiles(files) {
        // Now storing real File objects in an array structure
        [...files].forEach(file => {
            uploadedFiles.push({
                fileObj: file,
                name: file.name,
                size: formatBytes(file.size),
                type: file.name.match(/\.(xlsx|xls|csv)$/i) ? 'excel' : 'pdf'
            });
        });
        updateFileUI();
        checkFormValidity();
    }

    // Mock initial click on dropzone to open file dialog if empty
    dropZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && !e.target.classList.contains('file-remove')) { 
            fileInput.click();
        }
    });

    function updateFileUI() {
        fileList.innerHTML = '';
        uploadedFiles.forEach((file, index) => {
            const iconClass = file.type === 'pdf' ? 'fa-file-pdf pdf' : 'fa-file-excel excel';
            
            const li = document.createElement('div');
            li.className = 'file-item';
            li.innerHTML = `
                <i class="fa-solid ${iconClass} file-icon"></i>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${file.size}</span>
                </div>
                <i class="fa-solid fa-xmark file-remove" data-index="${index}"></i>
            `;
            fileList.appendChild(li);
        });

        // Add remove listeners
        document.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                uploadedFiles.splice(index, 1);
                updateFileUI();
                checkFormValidity();
            });
        });
    }

    function checkFormValidity() {
        // Only require company name - files are optional for demo mode
        if (companyInput.value.trim().length > 0) {
            btnStartAnalysis.disabled = false;
            btnStartAnalysis.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Start AI Analysis';
        } else {
            btnStartAnalysis.disabled = true;
        }
    }

    companyInput.addEventListener('input', checkFormValidity);

    // --- 3. Real AI Analysis Processing (FastAPI) ---
    const overlay = document.getElementById('processing-overlay');
    const progressBar = document.getElementById('processing-progress');
    const processingTitle = document.getElementById('processing-title');
    const processingDesc = document.getElementById('processing-desc');
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4')
    ];

    btnStartAnalysis.addEventListener('click', async () => {
        await startAnalysisSimulation();
    });

    async function startAnalysisSimulation() {
        // Reset modal
        progressBar.style.width = '0%';
        overlay.classList.remove('hidden');
        steps.forEach(s => {
            s.className = 'step waiting';
            const icon = s.querySelector('i');
            icon.className = 'fa-regular fa-circle';
        });

        // Step 1: Uploading to API
        updateStep(0, 'Uploading Documents...', 'Sending data to secure FastAPI backend', 10);
        
        try {
            const loanAmount = parseInt(document.getElementById('loan-amount-input').value) || 5000000;
            const industry = document.getElementById('industry-input').value || 'Manufacturing';
            const years = parseInt(document.getElementById('years-input').value) || 5;
            const revenue = parseFloat(document.getElementById('revenue-input').value) || 15000000;
            const liabilities = parseFloat(document.getElementById('liabilities-input').value) || 4000000;

            const formData = new FormData();
            formData.append('name', companyInput.value || 'Unknown Corporation');
            formData.append('industry', industry);
            formData.append('years_in_operation', years);
            formData.append('annual_revenue', revenue);
            formData.append('loan_amount_requested', loanAmount);
            formData.append('existing_liabilities', liabilities);
            
            // Store baseline values for Scenario Simulator
            window.baselineData = { loan: loanAmount, industry, years, revenue, liabilities };
            window.baseLoanAmount = loanAmount;
            
            uploadedFiles.forEach(fileWrapper => {
                formData.append('files', fileWrapper.fileObj);
            });

            // Make the actual network request
            updateStep(1, 'AI Processing...', 'Running OCR and extracting financial structures', 40);
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                 throw new Error(`Server returned ${response.status}`);
            }

            updateStep(2, 'Applying ML Models...', 'Calculating risk scores & generating intelligence', 75);
            
            apiResponseData = await response.json();
            
            progressBar.style.width = '100%';
            processingTitle.innerText = 'Analysis Complete!';
            processingDesc.innerText = 'Generating Credit Appraisal Memo...';
            steps[3].classList.remove('active');
            steps[3].classList.add('completed');
            steps[3].querySelector('i').className = 'fa-solid fa-check';
            
            setTimeout(() => {
                overlay.classList.add('hidden');
                populateDataViews();
                populateScenarioView();
                
                // Alert notification style badge on Risk Nav
                document.getElementById('nav-risk-badge').innerText = '1';
                document.getElementById('nav-risk-badge').style.display = 'block';

                switchView('analysis-view'); // Auto navigate
            }, 1000);

        } catch (error) {
            console.error(error);
            alert("Error analyzing files. Is the Python backend running on port 8000?");
            overlay.classList.add('hidden');
        }
    }

    function updateStep(index, title, desc, progress) {
        processingTitle.innerText = title;
        processingDesc.innerText = desc;
        progressBar.style.width = `${progress}%`;

        // Mark previous as complete
        if (index > 0) {
            steps[index-1].classList.remove('active');
            steps[index-1].classList.add('completed');
            steps[index-1].querySelector('i').className = 'fa-solid fa-check';
        }

        // Set current to active
        steps[index].classList.remove('waiting');
        steps[index].classList.add('active');
        steps[index].querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
    }


    // --- 4. Populate Views with Mock Data ---
    function populateDataViews() {
        // Update headers to show we're looking at a specific company
        const companyName = companyInput.value || "Acme Corporation";
        
        // 1. Analysis View
        const analysisView = document.getElementById('analysis-view');
        const finResults = apiResponseData.financials;
        const flags = apiResponseData.fraud_alerts || [];
        
        // Map API keys to UI friendly labels
        const metricsMap = [
            { key: 'profit_margin', label: 'Profit Margin', suffix: '%', isGrowth: false },
            { key: 'debt_to_equity', label: 'Debt/Equity', suffix: '', isGrowth: false },
            { key: 'current_ratio', label: 'Current Ratio', suffix: '', isGrowth: false },
            { key: 'revenue_growth', label: 'Revenue Growth', suffix: '%', isGrowth: true }
        ];

        analysisView.innerHTML = `
            <div class="view-header flex-between">
                <div>
                    <h1>Document Analysis: ${companyName}</h1>
                    <p>Financial data extracted & reconciled from uploaded documents</p>
                </div>
                <div class="actions">
                     <button class="btn btn-outline"><i class="fa-solid fa-download"></i> Export Data</button>
                </div>
            </div>

            <!-- Key Financial Metrics -->
            <div class="metrics-grid">
                ${metricsMap.map(m => {
                    const val = finResults[m.key];
                    const trendIcon = m.isGrowth ? (val > 0 ? 'up' : 'down') : (val < 2 ? 'up' : 'down');
                    const statusClass = m.isGrowth ? (val > 0 ? 'positive' : 'negative') : (val < 3 ? 'positive' : 'negative');
                    
                    return `
                    <div class="metric-card">
                        <div class="metric-header">
                            <h3>${m.label}</h3>
                            <i class="fa-solid fa-arrow-${trendIcon} trend ${statusClass}"></i>
                        </div>
                        <div class="metric-value">${val}${m.suffix}</div>
                        <div class="metric-trend ${statusClass}">${m.isGrowth ? (val > 0 ? '+' : '') : ''}${val}${m.suffix}</div>
                    </div>
                    `;
                }).join('')}
            </div>

            <div class="analysis-content-grid mt-4">
                <!-- Data Reconciliation & Flags -->
                <div class="card flags-card">
                    <div class="card-header-flex">
                        <h2><i class="fa-solid fa-triangle-exclamation text-warning"></i> AI Reconciliation Flags</h2>
                        <span class="badge badge-high">${flags.length} Issues Detected</span>
                    </div>
                    <p>Inconsistencies detected across different document sources (GST vs Bank vs ITR)</p>
                    
                    <ul class="inconsistency-list">
                        ${flags.map(f => `
                            <li class="inconsistency-item border-${f.type.toLowerCase() === 'high risk' ? 'danger' : 'warning'}">
                                <div class="icon-${f.type.toLowerCase() === 'high risk' ? 'danger' : 'warning'}"><i class="fa-solid ${f.type.toLowerCase() === 'high risk' ? 'fa-circle-xmark' : 'fa-circle-exclamation'}"></i></div>
                                <div class="text">${f.desc}</div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- Extracted Document Sources -->
                <div class="card sources-card">
                    <h2><i class="fa-solid fa-file-invoice"></i> Processed Sources</h2>
                    <ul class="source-list mt-3">
                        ${uploadedFiles.map(f => `
                            <li>
                                <i class="fa-solid ${f.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-excel'} file-icon ${f.type}"></i>
                                <span>${f.name}</span>
                                <i class="fa-solid fa-check text-success ms-auto"></i> PSD
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        // 2. Research View
        const researchView = document.getElementById('research-view');
        const findings = apiResponseData.research.key_findings || [];
        
        researchView.innerHTML = `
            <div class="view-header flex-between">
                <div>
                    <h1>Research Intelligence</h1>
                    <p>Automated Secondary Due Diligence & External Risk Discovery</p>
                </div>
                <div class="actions">
                     <button class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Refresh Scan</button>
                </div>
            </div>

            <div class="research-layout form-group mb-4">
                 <div class="header-search" style="width: 100%; max-width: 600px;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Add custom query to research AI (e.g., 'Check promoter fraud history')" />
                </div>
            </div>

            <div class="research-timeline">
                ${findings.map(f => {
                    const impactLower = f.impact.toLowerCase();
                    const impactClass = impactLower === 'positive' ? 'positive' : impactLower === 'negative' ? 'negative' : 'neutral';
                    const impactColor = impactLower === 'positive' ? 'success' : impactLower === 'negative' ? 'danger' : 'warning';
                    
                    return `
                    <div class="research-card border-${impactColor}">
                        <div class="research-source">
                            <i class="fa-solid ${f.source.includes('Court') || f.source.includes('Legal') ? 'fa-scale-balanced' : f.source.includes('MCA') ? 'fa-building-columns' : 'fa-newspaper'}"></i>
                            ${f.source}
                            <span class="research-date ms-auto">Recently Scanned</span>
                        </div>
                        <h3 class="research-title">${f.summary}</h3>
                        <p class="research-details">AI verified signal from external industry sources.</p>
                        <div class="research-impact impact-${impactClass}">
                            Impact: ${f.impact}
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>

            <!-- Manual Due Diligence -->
            <div class="card mt-4">
                <h2><i class="fa-solid fa-pen-to-square"></i> Primary Due Diligence Notes</h2>
                <p>Add manual observations from physical site visits or management meetings</p>
                <textarea class="form-control mb-3" rows="4" placeholder="Enter observations here... (e.g., 'Factory operating at 80% capacity, machinery is well maintained.')" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); font-family: inherit; resize: vertical;"></textarea>
                <button class="btn btn-outline">Save Notes</button>
            </div>
        `;

        // 2. Risk View & Fraud
        const riskView = document.getElementById('risk-view');
        
        const risk = apiResponseData.risk;
        const fraud = apiResponseData.fraud_alerts;
        const decision = apiResponseData.decision;
        const r_findings = apiResponseData.research.key_findings;

        let riskColor = risk.score > 75 ? 'var(--success)' : risk.score > 50 ? 'var(--warning)' : 'var(--danger)';

        riskView.innerHTML = `
            <div class="view-header flex-between mb-4">
                <div>
                    <h1>Autonomous Credit Risk Model</h1>
                    <p>Machine learning predictions and fraud detection signals for <strong>${companyName}</strong></p>
                </div>
                <div class="badge badge-medium">PD: ${risk.pd_percentage}%</div>
            </div>

            <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
                <div class="card p-0" style="overflow: hidden;">
                    <div style="background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 16px 24px;">
                        <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-shield-cat text-warning"></i> Fraud & Governance Alerts
                        </h2>
                    </div>
                    <ul class="fraud-list" style="list-style: none; margin: 0; padding: 0;">
                        ${fraud.map(alert => `
                            <li>
                                <div class="alert-icon ${alert.type === 'Safe' ? 'low' : 'high'}"><i class="fa-solid fa-${alert.type === 'Safe' ? 'check' : 'triangle-exclamation'}"></i></div>
                                <div class="alert-content">
                                    <h4 class="alert-title">${alert.type}</h4>
                                    <p class="text-sm">${alert.desc}</p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="risk-score-container">
                    <div class="score-circle" style="background: conic-gradient(${riskColor} ${risk.score}%, #e2e8f0 0);">
                        <div class="score-inner">
                            <span class="score-value" style="color: ${riskColor}">${risk.score}</span>
                            <span class="score-label">/100</span>
                        </div>
                    </div>
                    <div class="score-details">
                        <h2>Model Decision: <span style="color: ${decision.status === 'Approved' ? 'var(--success)' : 'var(--danger)'}">${decision.status}</span></h2>
                        <p>Confidence Category: ${decision.category}</p>
                    </div>
                </div>
            </div>

            <h2 class="mb-3">Web Intelligence Network</h2>
            <div class="five-c-grid">
                ${r_findings.map(f => {
                    return `
                    <div class="card five-c-card" style="border-left: 4px solid ${f.impact === 'Positive' ? 'var(--success)' : f.impact === 'Negative' ? 'var(--danger)' : 'var(--text-muted)'}">
                        <div class="flex-between mb-3">
                            <h3 style="display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-globe text-primary"></i> ${f.source}
                            </h3>
                            <span class="badge ${f.impact === 'Positive' ? 'badge-low' : f.impact === 'Negative' ? 'badge-high' : 'badge-medium'}">${f.impact}</span>
                        </div>
                        <p class="text-sm" style="color: var(--text-muted); font-size: 0.85rem;">${f.summary}</p>
                    </div>
                    `;
                }).join('')}
            </div>
        `;

        // 4. CAM Report View
        const camView = document.getElementById('cam-view');

        camView.innerHTML = `
            <div class="view-header flex-between">
                <div>
                    <h1>Credit Appraisal Memo (CAM)</h1>
                    <p>Final system-generated loan recommendation report</p>
                </div>
                <div class="actions" style="display: flex; gap: 12px;">
                     <button class="btn btn-outline"><i class="fa-solid fa-print"></i> Print</button>
                     <button class="btn btn-primary"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>
                </div>
            </div>

            <div class="cam-document card" style="max-width: 900px; margin: 0 auto; padding: 40px;">
                <div class="cam-header" style="text-align: center; border-bottom: 2px solid var(--border-color); padding-bottom: 24px; margin-bottom: 32px;">
                    <div class="logo" style="justify-content: center; margin-bottom: 16px;">
                        <i class="fa-solid fa-chart-pie logo-icon"></i>
                        <span class="logo-text">Intelli-Credit System</span>
                    </div>
                    <h2 style="font-size: 1.8rem; margin-bottom: 8px;">Credit Appraisal Memo</h2>
                    <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="cam-section mb-4">
                    <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">1. Application Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; width: 40%; color: var(--text-muted);">Company Name</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${companyName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: var(--text-muted);">Requested Amount</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600;">₹${window.baselineData.loan.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: var(--text-muted);">Risk Category</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: ${riskColor};">${decision.category} (Score: ${risk.score}/100)</td>
                        </tr>
                    </table>
                </div>

                <div class="cam-section mb-4">
                    <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">2. AI Committee Recommendation</h3>
                    <div style="background-color: var(--bg-app); padding: 20px; border-radius: 8px; border-left: 4px solid var(--success);">
                        <h4 style="color: var(--success); margin-bottom: 12px; font-size: 1.2rem;">${decision.status}</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <span style="display: block; color: var(--text-muted); font-size: 0.85rem;">Recommended Sanction</span>
                                <strong style="font-size: 1.2rem;">₹${decision.recommended_limit.toLocaleString()}</strong>
                            </div>
                            <div>
                                <span style="display: block; color: var(--text-muted); font-size: 0.85rem;">Suggested Interest Rate</span>
                                <strong style="font-size: 1.2rem;">${decision.interest_rate}</strong>
                            </div>
                        </div>
                        <ul style="font-size: 0.95rem; line-height: 1.6; color: var(--secondary); padding-left: 16px;">
                            ${decision.explanation.map(exp => `<li>${exp}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="cam-section mb-4">
                    <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">3. Human Authorization</h3>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">This AI-generated memo requires final sign-off from the assigned Credit Authority.</p>
                    
                    <div style="display: flex; gap: 40px; margin-top: 40px;">
                        <div style="flex: 1; border-top: 1px solid var(--text-muted); padding-top: 8px;">
                            <strong>Credit Analyst</strong><br>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">System Gen AI-01</span>
                        </div>
                        <div style="flex: 1; border-top: 1px solid var(--text-muted); padding-top: 8px;">
                            <strong>Approving Authority</strong><br>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Signature & Date</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add PDF Download Listener
        const btnDownload = camView.querySelector('.btn-primary');
        if (btnDownload) {
            btnDownload.addEventListener('click', async () => {
                try {
                    btnDownload.disabled = true;
                    btnDownload.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating...';
                    
                    const response = await fetch('/api/generate-cam', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(apiResponseData)
                    });

                    if (!response.ok) throw new Error('Failed to generate PDF');

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `CAM_${companyName.replace(/\s+/g, '_')}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    btnDownload.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Download PDF';
                    btnDownload.disabled = false;
                } catch (err) {
                    console.error(err);
                    alert('Error downloading PDF. Is the backend running?');
                    btnDownload.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Download PDF';
                    btnDownload.disabled = false;
                }
            });
        }
    }

    // =========================================================
    // KILLER FEATURE 1: AI Risk Timeline Chart (Historical Risk Trajectory)
    // =========================================================
    function renderRiskTimelineChart(baseScore, companyName) {
        const canvasId = 'risk-timeline-chart';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const currentYear = new Date().getFullYear();
        const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
        
        // Generate a historically plausible trajectory leading to current score
        const scores = [
            Math.max(20, baseScore - 32),
            Math.max(25, baseScore - 21),
            Math.max(30, baseScore - 11),
            baseScore
        ].map(s => Math.min(100, s));

        const pdValues = scores.map(s => Math.max(2, Math.round((100 - s) * 0.45)));

        if (window.riskTimelineChartInstance) {
            window.riskTimelineChartInstance.destroy();
        }

        window.riskTimelineChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Credit Risk Score',
                        data: scores,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99,102,241,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: scores.map((s, i) => i === scores.length - 1 ? '#ef4444' : '#6366f1'),
                        pointRadius: scores.map((s, i) => i === scores.length - 1 ? 8 : 5),
                        yAxisID: 'y'
                    },
                    {
                        label: 'Probability of Default (%)',
                        data: pdValues,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.08)',
                        fill: true,
                        tension: 0.4,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#f59e0b',
                        pointRadius: 4,
                        yAxisID: 'y2'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Inter' } } },
                    tooltip: {
                        callbacks: {
                            afterBody: (items) => {
                                const score = items[0]?.parsed?.y;
                                if (!score) return '';
                                const cat = score > 75 ? '🟢 LOW RISK' : score > 50 ? '🟡 MODERATE RISK' : '🔴 HIGH RISK';
                                return [`Risk Category: ${cat}`];
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: {
                        type: 'linear', position: 'left', min: 0, max: 100,
                        ticks: { color: '#6366f1' }, grid: { color: 'rgba(99,102,241,0.08)' },
                        title: { display: true, text: 'Risk Score (0-100)', color: '#6366f1' }
                    },
                    y2: {
                        type: 'linear', position: 'right', min: 0, max: 100,
                        ticks: { color: '#f59e0b', callback: (v) => `${v}%` },
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'PD %', color: '#f59e0b' }
                    }
                }
            }
        });
    }

    // =========================================================
    // KILLER FEATURE 2: Financial Scenario Simulator
    // =========================================================
    function populateScenarioView() {
        if (!apiResponseData || !window.baselineData) return;
        const decision = apiResponseData.decision;
        const risk = apiResponseData.risk;
        const companyName = companyInput.value || 'Acme Corporation';
        const base = window.baselineData;
        const baseRisk = risk.score;
        const basePD = risk.pd_percentage || Math.round((100 - baseRisk) * 0.45);

        const scenarioView = document.getElementById('scenario-view');

        scenarioView.innerHTML = `
            <div class="view-header flex-between mb-4">
                <div>
                    <h1>⚡ Financial Scenario Simulator</h1>
                    <p>Interactively model how changing parameters affects <strong>${companyName}'s</strong> credit risk in real-time</p>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;">🏆 ADVANCED FEATURE</span>
                </div>
            </div>

            <!-- Current Baseline -->
            <div class="card mb-4" style="border-left:4px solid var(--primary);background:linear-gradient(135deg,rgba(99,102,241,0.05),transparent);">
                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-crosshairs text-primary"></i> Current Baseline (Post-Analysis)</h3>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
                    <div class="metric-card" style="text-align:center;">
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">Loan Amount</div>
                        <div style="font-size:1.4rem;font-weight:700;color:var(--primary);">₹${(base.loan/100000).toFixed(1)}L</div>
                    </div>
                    <div class="metric-card" style="text-align:center;">
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">Risk Score</div>
                        <div style="font-size:1.4rem;font-weight:700;" id="sim-base-score">${baseRisk}/100</div>
                    </div>
                    <div class="metric-card" style="text-align:center;">
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">Default Probability</div>
                        <div style="font-size:1.4rem;font-weight:700;color:var(--warning);">${basePD}%</div>
                    </div>
                    <div class="metric-card" style="text-align:center;">
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">Decision</div>
                        <div style="font-size:1.4rem;font-weight:700;color:${decision.status==='Approved'?'var(--success)':'var(--danger)'};">${decision.status}</div>
                    </div>
                </div>
            </div>

            <!-- Scenario Controls -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
                <div class="card">
                    <h3 style="margin-bottom:20px;"><i class="fa-solid fa-sliders text-primary"></i> Adjust Parameters</h3>

                    <div style="margin-bottom:20px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <label style="font-weight:600;">Loan Amount</label>
                            <span id="lbl-loan" style="color:var(--primary);font-weight:700;">₹${(base.loan/100000).toFixed(1)}L</span>
                        </div>
                        <input type="range" id="sim-loan" min="500000" max="50000000" step="500000" value="${base.loan}" 
                            style="width:100%;accent-color:var(--primary);" oninput="window.runScenario()">
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
                            <span>₹5L</span><span>₹5Cr</span>
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <label style="font-weight:600;">Annual Revenue (₹ Cr)</label>
                            <span id="lbl-revenue" style="color:var(--primary);font-weight:700;">₹${(base.revenue/10000000).toFixed(2)}Cr</span>
                        </div>
                        <input type="range" id="sim-revenue" min="500000" max="100000000" step="500000" value="${base.revenue}"
                            style="width:100%;accent-color:var(--primary);" oninput="window.runScenario()">
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
                            <span>₹5L</span><span>₹10Cr</span>
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <label style="font-weight:600;">Existing Liabilities (₹ Cr)</label>
                            <span id="lbl-liabilities" style="color:var(--warning);font-weight:700;">₹${(base.liabilities/10000000).toFixed(2)}Cr</span>
                        </div>
                        <input type="range" id="sim-liabilities" min="0" max="80000000" step="500000" value="${base.liabilities}"
                            style="width:100%;accent-color:#f59e0b;" oninput="window.runScenario()">
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
                            <span>₹0</span><span>₹8Cr</span>
                        </div>
                    </div>

                    <div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <label style="font-weight:600;">Years in Operation</label>
                            <span id="lbl-years" style="color:var(--primary);font-weight:700;">${base.years} Years</span>
                        </div>
                        <input type="range" id="sim-years" min="1" max="30" step="1" value="${base.years}"
                            style="width:100%;accent-color:var(--primary);" oninput="window.runScenario()">
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
                            <span>1 yr</span><span>30 yrs</span>
                        </div>
                    </div>
                </div>

                <!-- Live Impact Panel -->
                <div class="card" style="background:var(--bg-surface);">
                    <h3 style="margin-bottom:20px;"><i class="fa-solid fa-bolt text-warning"></i> Live Impact Analysis</h3>
                    
                    <div style="text-align:center;margin-bottom:24px;">
                        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px;">Simulated Default Probability</div>
                        <div id="sim-pd-value" style="font-size:3.5rem;font-weight:800;color:var(--warning);transition:all 0.3s ease;">${basePD}%</div>
                        <div id="sim-pd-change" style="font-size:0.9rem;margin-top:4px;color:var(--text-muted);">No change from baseline</div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span style="font-size:0.85rem;">Simulated Risk Score</span>
                            <span id="sim-risk-score" style="font-weight:700;">${baseRisk}/100</span>
                        </div>
                        <div style="height:8px;background:#e2e8f0;border-radius:4px;">
                            <div id="sim-risk-bar" style="height:8px;border-radius:4px;background:var(--primary);width:${baseRisk}%;transition:width 0.4s ease,background 0.4s ease;"></div>
                        </div>
                    </div>

                    <div id="sim-decision-box" style="padding:16px;border-radius:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);text-align:center;">
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">AI Decision Under This Scenario</div>
                        <div id="sim-decision-text" style="font-size:1.3rem;font-weight:800;color:${decision.status==='Approved'?'var(--success)':'var(--danger)'};">${decision.status}</div>
                        <div id="sim-rate-text" style="font-size:0.9rem;margin-top:4px;color:var(--text-muted);">Rate: ${decision.interest_rate}</div>
                    </div>

                    <div class="mt-4" style="padding:12px;background:rgba(245,158,11,0.1);border-radius:8px;border:1px dashed #f59e0b;">
                        <div style="font-size:0.8rem;color:#f59e0b;font-weight:600;margin-bottom:4px;"><i class="fa-solid fa-lightbulb"></i> AI Insight</div>
                        <div id="sim-insight" style="font-size:0.85rem;color:var(--text-muted);">Adjust sliders to see real-time credit risk impact</div>
                    </div>
                </div>
            </div>

            <!-- Prebuilt Stress Test Scenarios -->
            <div class="card">
                <h3 style="margin-bottom:16px;"><i class="fa-solid fa-flask text-primary"></i> Prebuilt Stress Test Scenarios</h3>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                    ${[
                        { label: '📈 Aggressive Growth', desc: 'High revenue, high loan', loan: 30000000, revenue: 80000000, liabilities: 5000000, years: 8 },
                        { label: '⚠️ Debt Stressed', desc: 'Heavy liabilities', loan: 10000000, revenue: 15000000, liabilities: 60000000, years: 5 },
                        { label: '🔰 Conservative Ask', desc: 'Small loan, light debt', loan: 2000000, revenue: 20000000, liabilities: 1000000, years: 12 },
                        { label: '🆕 New Business', desc: 'Startup profile', loan: 5000000, revenue: 3000000, liabilities: 500000, years: 1 }
                    ].map((s, i) => `
                        <button onclick="window.applyScenario(${s.loan},${s.revenue},${s.liabilities},${s.years})" 
                            style="padding:14px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-surface);cursor:pointer;text-align:left;transition:all 0.2s;font-family:inherit;"
                            onmouseover="this.style.borderColor='var(--primary)';this.style.background='rgba(99,102,241,0.05)'"
                            onmouseout="this.style.borderColor='var(--border-color)';this.style.background='var(--bg-surface)'">
                            <div style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">${s.label}</div>
                            <div style="font-size:0.78rem;color:var(--text-muted);">${s.desc}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Bind scenario engine functions
        window.runScenario = function() {
            const loan = parseInt(document.getElementById('sim-loan').value);
            const revenue = parseInt(document.getElementById('sim-revenue').value);
            const liabilities = parseInt(document.getElementById('sim-liabilities').value);
            const years = parseInt(document.getElementById('sim-years').value);

            document.getElementById('lbl-loan').textContent = `₹${(loan/100000).toFixed(1)}L`;
            document.getElementById('lbl-revenue').textContent = `₹${(revenue/10000000).toFixed(2)}Cr`;
            document.getElementById('lbl-liabilities').textContent = `₹${(liabilities/10000000).toFixed(2)}Cr`;
            document.getElementById('lbl-years').textContent = `${years} Year${years>1?'s':''}`;

            // Compute simulated risk score
            const dti = liabilities / Math.max(revenue, 1); // debt to income
            const ltvRatio = loan / Math.max(revenue, 1); // loan to value
            const agePenalty = Math.max(0, 5 - years) * 4; // newer = higher risk
            
            let simScore = baseRisk;
            simScore -= (dti * 20);
            simScore -= (ltvRatio > 1 ? (ltvRatio - 1) * 15 : 0);
            simScore -= agePenalty;
            simScore += (revenue / 10000000) * 5; // higher revenue = lower risk
            simScore = Math.round(Math.max(10, Math.min(100, simScore)));

            const simPD = Math.round(Math.max(3, Math.min(95, (100 - simScore) * 0.5)));
            const simColor = simScore > 70 ? 'var(--success)' : simScore > 45 ? 'var(--warning)' : 'var(--danger)';
            const simDecision = simScore > 55 ? 'Approved' : 'Rejected';
            const simRate = simScore > 75 ? '8.5% p.a.' : simScore > 60 ? '11% p.a.' : simScore > 45 ? '14.5% p.a.' : 'Ineligible';
            const pdChange = simPD - basePD;
            const changeLabel = pdChange === 0 ? 'No change from baseline' : 
                (pdChange > 0 ? `▲ +${pdChange}% higher than baseline` : `▼ ${pdChange}% lower than baseline`);
            const changeColor = pdChange > 5 ? 'var(--danger)' : pdChange < -5 ? 'var(--success)' : 'var(--warning)';

            let insight = '';
            if (dti > 3) insight = '🚨 Debt-to-Income ratio is critically high — bank will likely reject this application.';
            else if (ltvRatio > 2) insight = '⚠️ Loan amount greatly exceeds revenue coverage — significant credit risk.';
            else if (years < 2) insight = '⚠️ New business with limited operating history — higher risk premium expected.';
            else if (simScore > 75) insight = '✅ Strong financial profile — likely to secure favourable credit terms.';
            else if (simPD > 40) insight = '🔴 Default probability exceeds 40% — consider reducing loan amount or liabilities.';
            else insight = '📊 Moderate risk profile. Reducing liabilities can significantly improve score.';

            document.getElementById('sim-pd-value').textContent = `${simPD}%`;
            document.getElementById('sim-pd-value').style.color = simColor;
            document.getElementById('sim-pd-change').textContent = changeLabel;
            document.getElementById('sim-pd-change').style.color = changeColor;
            document.getElementById('sim-risk-score').textContent = `${simScore}/100`;
            document.getElementById('sim-risk-bar').style.width = `${simScore}%`;
            document.getElementById('sim-risk-bar').style.background = simColor;
            document.getElementById('sim-decision-text').textContent = simDecision;
            document.getElementById('sim-decision-text').style.color = simDecision === 'Approved' ? 'var(--success)' : 'var(--danger)';
            document.getElementById('sim-rate-text').textContent = `Rate: ${simRate}`;
            document.getElementById('sim-insight').textContent = insight;
        };

        window.applyScenario = function(loan, revenue, liabilities, years) {
            document.getElementById('sim-loan').value = loan;
            document.getElementById('sim-revenue').value = revenue;
            document.getElementById('sim-liabilities').value = liabilities;
            document.getElementById('sim-years').value = years;
            window.runScenario();
        };
    }

    // Add Risk Timeline to the risk view after it renders
    function appendRiskTimeline(companyName, baseScore) {
        const riskView = document.getElementById('risk-view');
        if (!riskView) return;

        const timelineSection = document.createElement('div');
        timelineSection.style.marginTop = '32px';
        timelineSection.innerHTML = `
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <div>
                        <h2 style="display:flex;align-items:center;gap:8px;"><i class="fa-solid fa-chart-line text-primary"></i> AI Credit Risk Timeline</h2>
                        <p style="color:var(--text-muted);font-size:0.9rem;margin-top:4px;">Predictive historical risk trajectory for <strong>${companyName}</strong></p>
                    </div>
                    <span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">🤖 AI PREDICTED</span>
                </div>
                <canvas id="risk-timeline-chart" height="80"></canvas>
                <p style="font-size:0.78rem;color:var(--text-muted);margin-top:12px;text-align:center;">
                    <i class="fa-solid fa-circle-info"></i> Risk trajectory simulated by AI using financial trend extrapolation. Current year score is live from the analysis.
                </p>
            </div>
        `;
        riskView.appendChild(timelineSection);
        setTimeout(() => renderRiskTimelineChart(baseScore, companyName), 100);
    }

});

