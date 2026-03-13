import React, {useState} from 'react';
import {render, Box, Text, useInput, useStdout} from 'ink';
import ollama from 'ollama';
import {exec as _exec} from 'child_process';
import {promisify} from 'util';

const exec = promisify(_exec);

const MODEL = 'qwen2.5:3b';

async function planCommand(instruction) {
	const prompt = [
		'You are a Linux command planner.',
		'',
		'User instruction:',
		instruction,
		'',
		'Constraints:',
		'- Prefer simple commands that run in the CURRENT WORKING DIRECTORY only.',
		'- Do NOT scan the whole filesystem (avoid commands like find / or anything starting at /).',
		'- Do NOT use destructive commands (rm, mv, chmod, chown, dd, mkfs, etc.).',
		'',
		'Respond with ONLY the exact Linux shell command to run, no backticks, no explanations, no comments.',
		'If the request is unsafe, clearly destructive, or would touch the whole filesystem, respond with the single word: REFUSE.'
	].join('\n');

	const response = await ollama.chat({
		model: MODEL,
		messages: [
			{role: 'system', content: 'You convert natural language into safe Linux shell commands.'},
			{role: 'user', content: prompt}
		]
	});

	const content = response?.message?.content?.trim() ?? '';
	return content;
}

const CommandRunner = () => {
	const [input, setInput] = useState('');
	const [command, setCommand] = useState('');
	const [output, setOutput] = useState('');
	const [error, setError] = useState('');
	const [lastInstruction, setLastInstruction] = useState('');
	const [status, setStatus] = useState('idle'); // idle | planning | running
	const [history, setHistory] = useState([]); // {instruction, command, success}
	const [historyIndex, setHistoryIndex] = useState(null); // null = current input
	const {stdout} = useStdout();
	const isNarrow = (stdout?.columns || 0) < 80;

	useInput((inputKey, key) => {
		// Submit
		if (key.return) {
			if (!input.trim() || status === 'planning' || status === 'running') {
				return;
			}
			setHistoryIndex(null);
			runInstruction(input);
			return;
		}

		// Clear line: Ctrl+U
		if (key.ctrl && inputKey === 'u') {
			setInput('');
			setHistoryIndex(null);
			return;
		}

		// Repeat last: Ctrl+R
		if (key.ctrl && inputKey === 'r') {
			if (history[0]) {
				setInput(history[0].instruction);
				setHistoryIndex(0);
			}
			return;
		}

		// History navigation: Up/Down
		if (key.upArrow) {
			if (history.length === 0) return;
			setHistoryIndex(prev => {
				const nextIndex = prev === null ? 0 : Math.min(prev + 1, history.length - 1);
				const item = history[nextIndex];
				if (item) setInput(item.instruction);
				return nextIndex;
			});
			return;
		}

		if (key.downArrow) {
			if (history.length === 0) return;
			setHistoryIndex(prev => {
				if (prev === null) return null;
				const nextIndex = prev - 1;
				if (nextIndex < 0) {
					setInput('');
					return null;
				}
				const item = history[nextIndex];
				if (item) setInput(item.instruction);
				return nextIndex;
			});
			return;
		}

		// Backspace / delete
		if (key.backspace || key.delete) {
			setInput(prev => prev.slice(0, -1));
			setHistoryIndex(null);
			return;
		}

		// Regular character input
		if (inputKey) {
			setInput(prev => prev + inputKey);
			setHistoryIndex(null);
		}
	});
 
	const runInstruction = async (instruction) => {
		setStatus('planning');
		setOutput('');
		setError('');
		setCommand('');
		setLastInstruction('');

		try {
			const planned = await planCommand(instruction);

			if (!planned) {
				setError('Model did not return a command.');
				setStatus('idle');
				return;
			}

			if (planned.toUpperCase() === 'REFUSE') {
				setError('Refused to run a potentially unsafe command.');
				setStatus('idle');
				return;
			}

			// Basic safety guardrails against huge scans / whole filesystem traversal
			const lower = planned.toLowerCase();
			const dangerousPatterns = [
				'find /',
				'find  /',
				'du /',
				' du -',
				' rm ',
				'rm -rf',
				' mkfs',
				' dd ',
				' chmod ',
				' chown '
			];
			if (dangerousPatterns.some(p => lower.includes(p))) {
				setError('Blocked a potentially long-running or destructive command.');
				setStatus('idle');
				return;
			}

			setCommand(planned);
			setLastInstruction(instruction);
			setStatus('running');

			const {stdout, stderr} = await exec(planned, {
				shell: '/bin/bash',
				maxBuffer: 4 * 1024 * 1024 // 4 MB
			});
			setOutput(stdout || '(no stdout)');
			if (stderr) {
				setError(stderr);
			}

			setHistory(prev => [
				{
					instruction,
					command: planned,
					success: !stderr
				},
				...prev.slice(0, 9)
			]);
		} catch (err) {
			setError(err?.message ?? String(err));
		} finally {
			setStatus('idle');
			setInput('');
			setHistoryIndex(null);
		}
	};

	return React.createElement(
		Box,
		{flexDirection: 'column', paddingX: 1, paddingY: 1},
		// Title bar
		React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'cyanBright'},
				'╔════════════════════════ Command Runner Agent ═══════════════════════╗'
			),
			React.createElement(
				Text,
				{color: 'cyanBright'},
				'║ Translate your intent → safe Linux command → live output            ║'
			),
			React.createElement(
				Text,
				{color: 'cyanBright'},
				'╚══════════════════════════════════════════════════════════════════════╝'
			)
		),
		// Main area: left = output, right = history
		React.createElement(
			Box,
			{
				marginTop: 1,
				flexDirection: isNarrow ? 'column' : 'row'
			},
			// Left pane
			React.createElement(
				Box,
				{
					flexDirection: 'column',
					flexGrow: 1,
					marginRight: isNarrow ? 0 : 2,
					marginBottom: isNarrow ? 1 : 0
				},
				// Input "box"
				React.createElement(
					Box,
					{flexDirection: 'column'},
					React.createElement(
						Text,
						{color: 'greenBright'},
						'┌─ What should I do? ',
						status === 'planning'
							? '(planning...)'
							: status === 'running'
							? '(running...)'
							: '',
						' ─────────────────────────────┐'
					),
					React.createElement(
						Text,
						null,
						'│ ',
						input || ' ',
						' '
					),
					React.createElement(
						Text,
						{color: 'greenBright'},
						'└──────────────────────────────────────────────────────────────┘'
					)
				),
				React.createElement(
					Text,
					{dimColor: true},
					'e.g. "List files in this folder" · "Show disk usage" · "Print current directory"'
				),
				// Planned command
				command
					? React.createElement(
							Box,
							{marginTop: 1, flexDirection: 'column'},
							React.createElement(Text, {color: 'magentaBright'}, 'Planned command'),
							React.createElement(Text, null, '› ', command)
					  )
					: null,
				// Output
				output
					? React.createElement(
							Box,
							{marginTop: 1, flexDirection: 'column'},
							React.createElement(
								Text,
								{color: 'blueBright'},
								'┌─ Output ',
								lastInstruction ? `(for: ${lastInstruction})` : '',
								' ─────────────────────────────┐'
							),
							...output.split('\n').map((line, idx) =>
								React.createElement(
									Text,
									{key: `out-${idx}`},
									'│ ',
									line
								)
							),
							React.createElement(
								Text,
								{color: 'blueBright'},
								'└──────────────────────────────────────────────────────────────┘'
							)
					  )
					: null,
				// Error
				error
					? React.createElement(
							Box,
							{marginTop: 1, flexDirection: 'column'},
							React.createElement(Text, {color: 'redBright'}, 'Error / stderr'),
							React.createElement(Text, null, error)
					  )
					: null
			),
			// Right pane: history
			React.createElement(
				Box,
				{
					flexDirection: 'column',
					width: isNarrow ? undefined : 40
				},
				React.createElement(
					Text,
					{color: 'gray'},
					isNarrow ? 'History (last 10)' : '──────── History (last 10) ────────'
				),
				history.length === 0
					? React.createElement(Text, {dimColor: true}, 'No commands yet.')
					: history.map((h, idx) =>
							React.createElement(
								Box,
								{key: idx, flexDirection: 'column', marginBottom: 1},
								React.createElement(
									Text,
									{color: h.success ? 'green' : 'red'},
									h.success ? `#${idx + 1} ✓` : `#${idx + 1} ✗`,
									' ',
									h.command
								),
								React.createElement(Text, {dimColor: true}, '  ', h.instruction)
							)
					  )
			)
		),
		// Footer
		React.createElement(
			Box,
			{marginTop: 1},
			React.createElement(
				Text,
				{dimColor: true},
				'Enter: run  •  ↑/↓: browse history  •  Ctrl+R: repeat last  •  Ctrl+U: clear line  •  Ctrl+C: exit'
			)
		)
	);
};

render(React.createElement(CommandRunner, null));