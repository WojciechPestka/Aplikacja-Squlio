const DailyQuestions = require('../models/DailyQuestions');
const MathsQuestion = require('../models/MathsQuestions');
const ProgramingQuestion = require('../models/ProgramingQuestions')
const ScienceQuestion = require('../models/ScienceQuestions')
const EnglishQuestion = require('../models/EnglishQuestions')
const ItemShop = require('../models/ItemShop');

const CreateDailyQuestion = async (req, res) => {
    try {
        const { question, correct_answer, incorrect_answer_1, incorrect_answer_2, incorrect_answer_3 } = req.body;

        if (!question || !correct_answer || !incorrect_answer_1 || !incorrect_answer_2 || !incorrect_answer_3) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
        }

        const existingQuestion = await DailyQuestions.findOne({ question });
        if (existingQuestion) {
            return res.status(400).json({ message: 'Podane pytanie już znajduje się w bazie danych' });
        }

        const newQuestion = new DailyQuestions({
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
        });

        await newQuestion.save();
        console.log('Dodano nowe pytanie:', question);

        return res.status(201).json({ message: 'Dodano nowe pytanie pomyślnie' });
    } catch (error) {
        console.error('Błąd dodawania pytania:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania pytania', error: error.message });
    }
};

const CreateMathsQuestion = async (req, res) => {
    try {
        const {
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
            level,
            date,
            id_question,
        } = req.body;

        if (!question || !correct_answer || !incorrect_answer_1 || !incorrect_answer_2 || !incorrect_answer_3 || !level || !date || !id_question) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane dla pytania matematycznego' });
        }

        const existingMathsQuestion = await MathsQuestion.findOne({ level, "questions.id_question": id_question });
        if (existingMathsQuestion) {
            return res.status(400).json({ message: 'Podane pytanie matematyczne już istnieje w bazie danych dla tego poziomu trudności' });
        }

        const newMathsQuestion = {
            date: new Date(date),
            id_question,
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
        };

        let mathsDocument = await MathsQuestion.findOne({ level });
        if (!mathsDocument) {
            mathsDocument = new MathsQuestion({ level, questions: [] });
        }

        mathsDocument.questions.push(newMathsQuestion);
        await mathsDocument.save();
        console.log('Dodano nowe pytanie matematyczne:', question);

        return res.status(201).json({ message: 'Dodano nowe pytanie matematyczne pomyślnie' });
    } catch (error) {
        console.error('Błąd dodawania pytania matematycznego:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania pytania matematycznego', error: error.message });
    }
};

const CreateProgrammingQuestion = async (req, res) => {
    try {
        const {
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
            level,
            date,
            id_question,
        } = req.body;

        if (!question || !correct_answer || !incorrect_answer_1 || !incorrect_answer_2 || !incorrect_answer_3 || !level || !date || !id_question) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane dla pytania z programowania' });
        }

        const existingProgrammingQuestion = await ProgramingQuestion.findOne({ level, "questions.id_question": id_question });
        if (existingProgrammingQuestion) {
            return res.status(400).json({ message: 'Podane pytanie z programowania już istnieje w bazie danych dla tego poziomu trudności' });
        }

        const newProgrammingQuestion = {
            date: new Date(date),
            id_question,
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
        };

        let programmingDocument = await ProgramingQuestion.findOne({ level });
        if (!programmingDocument) {
            programmingDocument = new ProgramingQuestion({ level, questions: [] });
        }

        programmingDocument.questions.push(newProgrammingQuestion);
        await programmingDocument.save();
        console.log('Dodano nowe pytanie z programowania:', question);

        return res.status(201).json({ message: 'Dodano nowe pytanie z programowania pomyślnie' });
    } catch (error) {
        console.error('Błąd dodawania pytania z programowania:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania pytania z programowania', error: error.message });
    }
};

const CreateScienceQuestion = async (req, res) => {
    try {
        const {
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
            level,
            date,
            id_question,
        } = req.body;

        if (!question || !correct_answer || !incorrect_answer_1 || !incorrect_answer_2 || !incorrect_answer_3 || !level || !date || !id_question) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane dla pytania z nauk ścisłych' });
        }

        const existingScienceQuestion = await ScienceQuestion.findOne({ level, "questions.id_question": id_question });
        if (existingScienceQuestion) {
            return res.status(400).json({ message: 'Podane pytanie z nauk ścisłych już istnieje w bazie danych dla tego poziomu trudności' });
        }

        const newScienceQuestion = {
            date: new Date(date),
            id_question,
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
        };

        let scienceDocument = await ScienceQuestion.findOne({ level });
        if (!scienceDocument) {
            scienceDocument = new ScienceQuestion({ level, questions: [] });
        }

        scienceDocument.questions.push(newScienceQuestion);
        await scienceDocument.save();
        console.log('Dodano nowe pytanie z nauk ścisłych:', question);

        return res.status(201).json({ message: 'Dodano nowe pytanie z nauk ścisłych pomyślnie' });
    } catch (error) {
        console.error('Błąd dodawania pytania z nauk ścisłych:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania pytania z nauk ścisłych', error: error.message });
    }
};

const CreateEnglishQuestion = async (req, res) => {
    try {
        const {
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
            level,
            date,
            id_question,
        } = req.body;

        if (!question || !correct_answer || !incorrect_answer_1 || !incorrect_answer_2 || !incorrect_answer_3 || !level || !date || !id_question) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane dla pytania z języka angielskiego' });
        }

        const existingEnglishQuestion = await EnglishQuestion.findOne({ level, "questions.id_question": id_question });
        if (existingEnglishQuestion) {
            return res.status(400).json({ message: 'Podane pytanie z języka angielskiego już istnieje w bazie danych dla tego poziomu trudności' });
        }

        const newEnglishQuestion = {
            date: new Date(date),
            id_question,
            question,
            correct_answer,
            incorrect_answer_1,
            incorrect_answer_2,
            incorrect_answer_3,
        };

        let englishDocument = await EnglishQuestion.findOne({ level });
        if (!englishDocument) {
            englishDocument = new EnglishQuestion({ level, questions: [] });
        }

        englishDocument.questions.push(newEnglishQuestion);
        await englishDocument.save();
        console.log('Dodano nowe pytanie z języka angielskiego:', question);

        return res.status(201).json({ message: 'Dodano nowe pytanie z języka angielskiego pomyślnie' });
    } catch (error) {
        console.error('Błąd dodawania pytania z języka angielskiego:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania pytania z języka angielskiego', error: error.message });
    }
};


const CreateShopItem = async (req, res) => {
    try {
        const { id, type, url, requiredLevel, cost, name } = req.body;

        if (!id || !type || !url || !requiredLevel || !cost || !name) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
        }

        const existingItem = await ItemShop.findOne({ id });
        if (existingItem) {
            return res.status(400).json({ message: 'Przedmiot z podanym ID już istnieje' });
        }

        const newItem = new ItemShop({
            id,
            type,
            url,
            requiredLevel,
            cost,
            name
        });

        await newItem.save();
        console.log('Dodano nowy przedmiot do sklepu:', newItem);

        return res.status(201).json({ message: 'Dodano nowy przedmiot do sklepu pomyślnie', item: newItem });
    } catch (error) {
        console.error('Błąd dodawania przedmiotu do sklepu:', error);
        return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania przedmiotu do sklepu', error: error.message });
    }
};

module.exports = { 
    CreateDailyQuestion, 
    CreateMathsQuestion, 
    CreateShopItem, 
    CreateProgrammingQuestion,
    CreateScienceQuestion,
    CreateEnglishQuestion 
};
