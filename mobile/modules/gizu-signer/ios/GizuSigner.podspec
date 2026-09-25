Pod::Spec.new do |s|
  s.name = 'GizuSigner'
  s.version = '0.1.0'
  s.summary = 'Gizu native-only signing compatibility probe'
  s.description = s.summary
  s.license = { :type => 'Proprietary' }
  s.author = 'Gizu'
  s.homepage = 'https://gizu.io'
  s.source = { :git => 'https://gizu.io' }
  s.platform = :ios, '16.4'
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.vendored_frameworks = 'GizuSignerCore.xcframework'
end
