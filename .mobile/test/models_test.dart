import 'package:flutter_test/flutter_test.dart';
import 'package:cactus_openai_server/models.dart';

void main() {
  group('ModelInfo Tests', () {
    test('Constructor correctly assigns all values', () {
      final model = ModelInfo(
        id: 'test-id',
        name: 'Test Model',
        size: '1.0GB',
        contextWindow: '8k',
        tokenLimit: '2048',
        speedRating: 'Fast',
        trainedDate: '2023-01-01',
        vram: '4GB',
        roles: ['role1', 'role2'],
        tools: ['tool1', 'tool2'],
        languages: 'English',
        quantization: 'Q4_K_M',
        isDownloaded: true,
        isSupported: false,
        targetUnit: 'GPU',
        pciDeviceId: '0x1234:0x5678',
        unitId: 1,
      );

      expect(model.id, 'test-id');
      expect(model.name, 'Test Model');
      expect(model.size, '1.0GB');
      expect(model.contextWindow, '8k');
      expect(model.tokenLimit, '2048');
      expect(model.speedRating, 'Fast');
      expect(model.trainedDate, '2023-01-01');
      expect(model.vram, '4GB');
      expect(model.roles, ['role1', 'role2']);
      expect(model.tools, ['tool1', 'tool2']);
      expect(model.languages, 'English');
      expect(model.quantization, 'Q4_K_M');
      expect(model.isDownloaded, true);
      expect(model.isSupported, false);
      expect(model.targetUnit, 'GPU');
      expect(model.pciDeviceId, '0x1234:0x5678');
      expect(model.unitId, 1);
    });

    test('Constructor uses default values', () {
      final model = ModelInfo(
        id: 'test-id',
        name: 'Test Model',
        size: '1.0GB',
        contextWindow: '8k',
        tokenLimit: '2048',
        speedRating: 'Fast',
        trainedDate: '2023-01-01',
        vram: '4GB',
        roles: ['role1'],
        tools: ['tool1'],
        languages: 'English',
      );

      expect(model.quantization, 'Q8');
      expect(model.isDownloaded, false);
      expect(model.isSupported, true);
      expect(model.targetUnit, 'NPU');
      expect(model.pciDeviceId, '0x8086:0x9A40');
      expect(model.unitId, 0);
    });
  });

  group('Message Tests', () {
    test('Constructor correctly assigns values', () {
      final message = Message(role: 'user', text: 'Hello');
      expect(message.role, 'user');
      expect(message.text, 'Hello');
    });
  });

  group('LoadStatus Tests', () {
    test('Enum has expected values', () {
      expect(LoadStatus.values, [
        LoadStatus.none,
        LoadStatus.loading,
        LoadStatus.success,
        LoadStatus.error,
      ]);
    });
  });
}
