<?php
// Video Processor Installation Script
// This script will automatically set up your video processor website

// Prevent direct access if already installed
if (file_exists('install_complete.lock')) {
    header('Location: index.html');
    exit;
}

// Define installation steps
$steps = [
    'check_requirements' => 'Checking Server Requirements',
    'configure_headers' => 'Configuring Server Headers',
    'setup_directories' => 'Setting Up Directories',
    'finalize' => 'Finalizing Installation'
];

// Current step (default to first)
$current_step = isset($_GET['step']) ? $_GET['step'] : 'check_requirements';

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle each step's form submission
    switch ($current_step) {
        case 'check_requirements':
            $current_step = 'configure_headers';
            break;
            
        case 'configure_headers':
            // Create .htaccess file with required headers
            $htaccess_content = <<<EOT
# Enable client-side routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Set CORS headers for FFmpeg.wasm
<IfModule mod_headers.c>
  Header set Cross-Origin-Embedder-Policy "require-corp"
  Header set Cross-Origin-Opener-Policy "same-origin"
  
  # Cache FFmpeg files
  <FilesMatch "\.(wasm|js)$">
    Header set Cache-Control "public, max-age=31536000"
  </FilesMatch>
</IfModule>
EOT;
            
            file_put_contents('.htaccess', $htaccess_content);
            $current_step = 'setup_directories';
            break;
            
        case 'setup_directories':
            // Create temp directory for file processing
            if (!file_exists('temp')) {
                mkdir('temp', 0755);
                file_put_contents('temp/.htaccess', 'Options -Indexes');
            }
            
            $current_step = 'finalize';
            break;
            
        case 'finalize':
            // Create lock file to prevent reinstallation
            file_put_contents('install_complete.lock', date('Y-m-d H:i:s'));
            
            // Redirect to the main application
            header('Location: index.html');
            exit;
    }
    
    // Redirect to next step
    header("Location: install.php?step=$current_step");
    exit;
}

// Check server requirements
function check_requirements() {
    $requirements = [
        'PHP Version' => [
            'required' => '7.0.0',
            'current' => phpversion(),
            'status' => version_compare(phpversion(), '7.0.0', '>=')
        ],
        'mod_rewrite' => [
            'required' => 'Enabled',
            'current' => in_array('mod_rewrite', apache_get_modules()) ? 'Enabled' : 'Disabled',
            'status' => in_array('mod_rewrite', apache_get_modules())
        ],
        'mod_headers' => [
            'required' => 'Enabled',
            'current' => in_array('mod_headers', apache_get_modules()) ? 'Enabled' : 'Disabled',
            'status' => in_array('mod_headers', apache_get_modules())
        ],
        'Write Permissions' => [
            'required' => 'Writable',
            'current' => is_writable('.') ? 'Writable' : 'Not Writable',
            'status' => is_writable('.')
        ]
    ];
    
    return $requirements;
}

// HTML header
$title = "Video Processor Installation - " . $steps[$current_step];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $title; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-3xl">
        <header class="text-center mb-8">
            <h1 class="text-3xl font-bold text-blue-600">Video Processor Installation</h1>
            <p class="text-gray-600 mt-2">Setting up your client-side video processing application</p>
        </header>
        
        <!-- Progress bar -->
        <div class="mb-8">
            <div class="flex mb-2">
                <?php 
                $step_count = count($steps);
                $current_index = array_search($current_step, array_keys($steps));
                $progress_percent = ($current_index / ($step_count - 1)) * 100;
                
                foreach ($steps as $step_key => $step_name): 
                    $is_active = $step_key === $current_step;
                    $is_completed = array_search($step_key, array_keys($steps)) < $current_index;
                ?>
                <div class="flex-1 text-center">
                    <div class="<?php echo $is_active ? 'text-blue-600 font-medium' : ($is_completed ? 'text-green-600' : 'text-gray-400'); ?> text-xs">
                        <?php echo $step_name; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: <?php echo $progress_percent; ?>%"></div>
            </div>
        </div>
        
        <!-- Step content -->
        <div class="bg-white p-6 rounded-lg shadow-md">
            <?php if ($current_step === 'check_requirements'): ?>
                <h2 class="text-xl font-semibold mb-4">Server Requirements Check</h2>
                <p class="mb-4">Checking if your server meets the requirements for running Video Processor:</p>
                
                <div class="mb-6">
                    <?php 
                    $requirements = check_requirements();
                    $all_passed = true;
                    
                    foreach ($requirements as $name => $req): 
                        $all_passed = $all_passed && $req['status'];
                    ?>
                    <div class="flex justify-between items-center py-2 border-b">
                        <div>
                            <span class="font-medium"><?php echo $name; ?></span>
                            <span class="text-sm text-gray-500 ml-2">Required: <?php echo $req['required']; ?></span>
                        </div>
                        <div class="flex items-center">
                            <span class="mr-2"><?php echo $req['current']; ?></span>
                            <?php if ($req['status']): ?>
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                            <?php else: ?>
                                <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                </svg>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                
                <form method="post" action="install.php?step=check_requirements">
                    <div class="flex justify-between">
                        <div></div>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" <?php echo !$all_passed ? 'disabled' : ''; ?>>
                            Continue
                        </button>
                    </div>
                    <?php if (!$all_passed): ?>
                        <p class="text-red-500 text-sm mt-4">Please fix the requirements that failed before continuing.</p>
                    <?php endif; ?>
                </form>
                
            <?php elseif ($current_step === 'configure_headers'): ?>
                <h2 class="text-xl font-semibold mb-4">Configure Server Headers</h2>
                <p class="mb-4">The following headers will be added to your server configuration to enable FFmpeg.wasm:</p>
                
                <div class="bg-gray-100 p-4 rounded mb-6 font-mono text-sm overflow-x-auto">
                    <pre># Set CORS headers for FFmpeg.wasm
Header set Cross-Origin-Embedder-Policy "require-corp"
Header set Cross-Origin-Opener-Policy "same-origin"

# Cache FFmpeg files
&lt;FilesMatch "\.(wasm|js)$"&gt;
  Header set Cache-Control "public, max-age=31536000"
&lt;/FilesMatch&gt;</pre>
                </div>
                
                <form method="post" action="install.php?step=configure_headers">
                    <div class="flex justify-between">
                        <div></div>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Configure Headers
                        </button>
                    </div>
                </form>
                
            <?php elseif ($current_step === 'setup_directories'): ?>
                <h2 class="text-xl font-semibold mb-4">Setup Directories</h2>
                <p class="mb-4">The installer will create the following directories:</p>
                
                <ul class="list-disc pl-5 mb-6">
                    <li class="mb-2">
                        <span class="font-medium">temp/</span> - Temporary directory for file processing
                    </li>
                </ul>
                
                <form method="post" action="install.php?step=setup_directories">
                    <div class="flex justify-between">
                        <div></div>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Create Directories
                        </button>
                    </div>
                </form>
                
            <?php elseif ($current_step === 'finalize'): ?>
                <h2 class="text-xl font-semibold mb-4">Installation Complete</h2>
                <p class="mb-4">Your Video Processor application has been successfully configured!</p>
                
                <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-green-700">
                                All configuration steps have been completed. You can now start using your application.
                            </p>
                        </div>
                    </div>
                </div>
                
                <form method="post" action="install.php?step=finalize">
                    <div class="flex justify-between">
                        <div></div>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Go to Application
                        </button>
                    </div>
                </form>
            <?php endif; ?>
        </div>
        
        <footer class="mt-8 text-center text-sm text-gray-500">
            <p>Video Processor Installer &copy; <?php echo date('Y'); ?></p>
        </footer>
    </div>
</body>
</html>