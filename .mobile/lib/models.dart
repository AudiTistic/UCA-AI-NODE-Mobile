enum LoadStatus { none, loading, success, error }

class ModelInfo {
  final String id;
  final String name;
  final String size;
  final String contextWindow;
  final String tokenLimit;
  final String speedRating;
  final String trainedDate;
  final String vram;
  final List<String> roles;
  final List<String> tools;
  final String languages;
  final String quantization;
  bool isDownloaded;
  final bool isSupported;
  final String targetUnit; // NPU, GPU, CPU, XPU
  final String pciDeviceId;
  final int unitId;

  ModelInfo({
    required this.id,
    required this.name,
    required this.size,
    required this.contextWindow,
    required this.tokenLimit,
    required this.speedRating,
    required this.trainedDate,
    required this.vram,
    required this.roles,
    required this.tools,
    required this.languages,
    this.quantization = 'Q8',
    this.isDownloaded = false,
    this.isSupported = true,
    this.targetUnit = 'NPU',
    this.pciDeviceId = '0x8086:0x9A40',
    this.unitId = 0,
  });
}

class Message {
  final String role;
  final String text;
  Message({required this.role, required this.text});
}
