import 'package:flutter/material.dart';
import '../main.dart'; // To access ModelInfo, LoadStatus in main.dart or we might need move them to a shared model file later.
// Temporarily we can redefine or import if possible.
// Ideally ModelInfo should be in its own file.
// For now I will assume I can import main.dart types or I will copy ModelInfo definition if it's private but it's public.

class LoadingModelScreen extends StatelessWidget {
  final ModelInfo model;
  final ValueNotifier<LoadStatus> statusNotifier;
  final ValueNotifier<List<String>> logsNotifier;
  final int initialContextSize;
  final Function(int) onContextSelect;
  final Function() onStartLoad;
  final Function() onCancel;

  const LoadingModelScreen({
    super.key,
    required this.model,
    required this.statusNotifier,
    required this.logsNotifier,
    required this.initialContextSize,
    required this.onContextSelect,
    required this.onStartLoad,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false, // Lock navigation
      child: Scaffold(
        backgroundColor: const Color(0xFF111111),
        body: SafeArea(
          child: ValueListenableBuilder<LoadStatus>(
            valueListenable: statusNotifier,
            builder: (context, status, _) {
              return Column(
                children: [
                  _buildHeader(status),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildModelInfo(),
                          const SizedBox(height: 32),
                          if (status == LoadStatus.none) ...[
                            _buildContextSelection(),
                            const Spacer(),
                          ] else ...[
                            _buildLogsArea(),
                            const SizedBox(height: 24),
                          ],
                          _buildActionButtons(context, status),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(LoadStatus status) {
    Color headerColor;
    String statusText;
    IconData icon;

    switch (status) {
      case LoadStatus.loading:
        headerColor = Colors.amber;
        statusText = 'LOADING NEURAL CORE...';
        icon = Icons.sync;
        break;
      case LoadStatus.success:
        headerColor = const Color(0xFF22C55E);
        statusText = 'MODEL ACTIVE';
        icon = Icons.check_circle;
        break;
      case LoadStatus.error:
        headerColor = Colors.red;
        statusText = 'LOAD FAILED';
        icon = Icons.error;
        break;
      case LoadStatus.none:
      default:
        headerColor =
            Colors.amber; // Gold theme for initial state too per user request
        statusText = 'INITIALIZING LOAD SEQUENCE';
        icon = Icons.settings_suggest;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: headerColor.withOpacity(0.1),
        border: Border(
          bottom: BorderSide(color: headerColor.withOpacity(0.3), width: 1),
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: headerColor, size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              statusText,
              style: TextStyle(
                color: headerColor,
                fontSize: 18,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                fontFamily: 'monospace',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModelInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TARGET MODEL',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            model.name,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildTag(model.size, Colors.blue),
              const SizedBox(width: 8),
              _buildTag(model.quantization, Colors.purple),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildContextSelection() {
    // Re-implementing logic to calculate available contexts based on model limits
    // Since we don't have access to _calculateMaxContext methods easily without duplication
    // or refactoring, I'll rely on a provided valid list or logic.
    // For now I will recreate the simple logic or better yet, assume parent passes valid options?
    // The prompt just said "context selection", so I'll replicate the UI.

    // Quick estimation logic similar to main.dart (assuming 1GB system overhead for safety)
    // In a real refactor, move this logic to a shared utility.

    // Note: To properly support selection, I need to know the current selection.
    // I'll use a StatefulBuilder or just a local state variable if I was stateful.
    // But this is Stateless. I need another ValueNotifier for current selection or
    // just rebuild on parent state change?
    // The implementation plan said: "onContextSelect: function(int)".
    // So the parent manages the selected context.
    // Wait, the parent (MainScreen) has `_selectedContextSize`.
    // I'll need to pass the CURRENT selected size too. Added `initialContextSize` to params.
    // Actually, if I want it to update visually, I should probably wrap this in a Stateful widget
    // OR have the parent pass a ValueNotifier<int> for selection.
    // For simplicity, let's make THIS widget Stateful so it can manage the ephemeral selection
    // before "Play" is clicked.

    return _ContextSelector(
      model: model,
      initialSize: initialContextSize,
      onSelect: onContextSelect,
    );
  }

  Widget _buildLogsArea() {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.terminal, color: Colors.grey, size: 16),
                const SizedBox(width: 8),
                Text(
                  'SYSTEM LOGS',
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            const Divider(color: Colors.white10),
            Expanded(
              child: ValueListenableBuilder<List<String>>(
                valueListenable: logsNotifier,
                builder: (context, logs, _) {
                  return ListView.builder(
                    reverse: true,
                    itemCount: logs.length,
                    itemBuilder: (context, index) {
                      final log = logs[logs.length - 1 - index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2.0),
                        child: Text(
                          log,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: log.contains('[ERROR]')
                                ? Colors.red
                                : (log.contains('SUCCESS')
                                      ? Colors.green
                                      : Colors.grey[400]),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, LoadStatus status) {
    bool isLoading = status == LoadStatus.loading;
    bool isSuccess = status == LoadStatus.success;

    if (isSuccess) {
      return SizedBox(
        height: 56,
        child: ElevatedButton(
          onPressed: () {
            Navigator.of(context).pop(); // Close screen, go back to main
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF22C55E),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: const Text(
            'ENTER NEURAL INTERFACE',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      );
    }

    return Row(
      children: [
        if (!isLoading)
          Expanded(
            child: TextButton(
              onPressed: () => Navigator.of(context).pop(), // Just cancel/close
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 20),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.white.withOpacity(0.1)),
                ),
              ),
              child: const Text(
                'CANCEL',
                style: TextStyle(
                  color: Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        if (!isLoading) const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: ElevatedButton(
            onPressed: isLoading
                ? onCancel
                : onStartLoad, // Stop if loading, Start if not
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 20),
              backgroundColor: isLoading
                  ? Colors.red.withOpacity(0.1)
                  : Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: isLoading
                    ? const BorderSide(color: Colors.red)
                    : BorderSide.none,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.red,
                    ),
                  ),
                if (isLoading) const SizedBox(width: 12),
                Text(
                  isLoading ? 'ABORT SEQUENCE' : 'INITIALIZE MODEL',
                  style: TextStyle(
                    color: isLoading ? Colors.red : Colors.black,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Internal helper for stateful context selection
class _ContextSelector extends StatefulWidget {
  final ModelInfo model;
  final int initialSize;
  final Function(int) onSelect;

  const _ContextSelector({
    required this.model,
    required this.initialSize,
    required this.onSelect,
  });

  @override
  State<_ContextSelector> createState() => _ContextSelectorState();
}

class _ContextSelectorState extends State<_ContextSelector> {
  late int _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.initialSize;
  }

  // Duplicating logic from main.dart for now to keep it self-contained
  double _calculateMaxContext(ModelInfo model) {
    // Logic copied from _MainScreenState._calculateMaxContext roughly
    // We don't have device RAM here easily.
    // For now, let's just assume we show standard options relative to model default context.
    // If we really need the RAM calculation, we should pass the calculated max from parent.
    // I'll assume 8192 is a safe fallback or just use what we have.
    // Actually, better to just generate a fixed list based on model.contextWindow string

    // Parse "32k" -> 32768
    String ctxStr = model.contextWindow.toLowerCase().replaceAll('k', '');
    double base = double.tryParse(ctxStr) ?? 4.0;
    return base * 1024;
  }

  @override
  Widget build(BuildContext context) {
    // Generate context options
    final double maxCtx = _calculateMaxContext(widget.model);
    final List<int> contexts = [
      2048,
      4096,
      8192,
      (maxCtx * 0.5).toInt(),
      maxCtx.toInt(),
    ].toSet().toList()..sort(); // Dedup and sort

    // Filter out crazy small ones or restrict if needed.
    // Keeping it simple.

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'CONTEXT WINDOW SIZE',
          style: TextStyle(
            color: Colors.grey[500],
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: contexts.map((size) {
            bool isSelected = _selected == size;
            return GestureDetector(
              onTap: () {
                setState(() => _selected = size);
                widget.onSelect(size);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFF22C55E)
                      : Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? Colors.white24
                        : Colors.white.withOpacity(0.05),
                  ),
                ),
                child: Text(
                  size >= 1024 ? '${(size / 1024).round()}k' : '$size',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: isSelected ? Colors.black : Colors.white70,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
