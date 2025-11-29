import { query } from '$app/server';
import { faker } from '@faker-js/faker';
import type { FileCellData } from '$lib';

export interface Person {
	id: string;
	name?: string;
	age?: number;
	email?: string;
	website?: string;
	notes?: string;
	salary?: number;
	department?: string;
	status?: string;
	skills?: string[];
	isActive?: boolean;
	startDate?: string;
	attachments?: FileCellData[];
}

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'] as const;
const statuses = ['Active', 'On Leave', 'Remote', 'In Office'] as const;
const skills = [
	'JavaScript',
	'TypeScript',
	'React',
	'Node.js',
	'Python',
	'SQL',
	'AWS',
	'Docker',
	'Git',
	'Agile'
] as const;

const notes = [
	'Excellent team player with strong communication skills. Consistently meets deadlines and delivers high-quality work.',
	'Currently working on the Q4 project initiative. Requires additional training in advanced analytics tools.',
	'Relocated from the Seattle office last month. Adjusting well to the new team dynamics and company culture.',
	'Submitted request for professional development courses. Shows great initiative in learning new technologies.',
	'Outstanding performance in the last quarter. Recommended for leadership training program next year.',
	'Recently completed certification in project management. Looking to take on more responsibility in upcoming projects.',
	'Needs improvement in time management. Working with mentor to develop better organizational skills.',
	'Transferred from the marketing department. Bringing valuable cross-functional experience to the team.',
	'On track for promotion consideration. Has exceeded expectations in client relationship management.',
	'Participating in the company mentorship program. Showing strong potential for career advancement.',
	'Recently returned from parental leave. Successfully reintegrated into current project workflows.',
	'Fluent in three languages. Often assists with international client communications and translations.',
	'Leading the diversity and inclusion initiative. Organizing monthly team building events and workshops.',
	'Requested flexible work arrangement for family care. Maintaining productivity while working remotely.',
	"Completed advanced training in data visualization. Now serving as the team's go-to expert for dashboards."
];

const sampleFiles = [
	{ name: 'Resume.pdf', type: 'application/pdf', sizeRange: [50, 500] },
	{ name: 'Contract.pdf', type: 'application/pdf', sizeRange: [100, 300] },
	{ name: 'ID_Document.pdf', type: 'application/pdf', sizeRange: [200, 400] },
	{ name: 'Profile_Photo.jpg', type: 'image/jpeg', sizeRange: [500, 2000] },
	{
		name: 'Presentation.pptx',
		type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		sizeRange: [1000, 5000]
	},
	{
		name: 'Report.docx',
		type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		sizeRange: [100, 800]
	},
	{
		name: 'Timesheet.xlsx',
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		sizeRange: [50, 200]
	},
	{ name: 'Certificate.pdf', type: 'application/pdf', sizeRange: [200, 500] },
	{ name: 'Background_Check.pdf', type: 'application/pdf', sizeRange: [300, 600] },
	{ name: 'Training_Video.mp4', type: 'video/mp4', sizeRange: [5000, 15000] }
] as const;

function generatePerson(id: number): Person {
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();

	// Generate 0-3 files for this person
	const fileCount = faker.number.int({ min: 0, max: 3 });
	const selectedFiles = faker.helpers.arrayElements(sampleFiles, fileCount);

	const attachments: FileCellData[] = selectedFiles.map((file, index) => {
		const sizeKB = faker.number.int({
			min: file.sizeRange[0],
			max: file.sizeRange[1]
		});
		return {
			id: `${id}-file-${index}`,
			name: file.name,
			size: sizeKB * 1024, // Convert to bytes
			type: file.type,
			url: `https://example.com/files/${id}/${file.name}`
		};
	});

	return {
		id: faker.string.nanoid(8),
		name: `${firstName} ${lastName}`,
		age: faker.number.int({ min: 22, max: 65 }),
		email: faker.internet.email({ firstName, lastName }).toLowerCase(),
		website: faker.internet.url().replace(/\/$/, ''),
		notes: faker.helpers.arrayElement(notes),
		salary: faker.number.int({ min: 40000, max: 150000 }),
		department: faker.helpers.arrayElement(departments),
		status: faker.helpers.arrayElement(statuses),
		isActive: faker.datatype.boolean(),
		startDate:
			faker.date.between({ from: '2018-01-01', to: '2024-01-01' }).toISOString().split('T')[0] ??
			'',
		skills: faker.helpers.arrayElements(skills, { min: 1, max: 5 }),
		attachments
	};
}

export const getPersons = query(async () => {
	// Seed faker for consistent data
	faker.seed(12345);

	// Generate data on the server
	const persons: Person[] = Array.from({ length: 10000 }, (_, i) => generatePerson(i + 1));

	return {
		persons,
		departments: [...departments],
		statuses: [...statuses],
		skills: [...skills]
	};
});
