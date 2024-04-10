import pandas as pd

DICT_PATH = 'dictionary.txt'
EASY_DICT_PATH = 'easy_bot_dictionary.txt'
MED_DICT_PATH = 'medium_bot_dictionary.txt'
HARD_DICT_PATH = 'hard_bot_dictionary.txt'

def load_dict(path) -> list[str]:
    start_processing = False
    words = []
    with open(path, 'r', encoding='utf8') as file:
        for line in file:
            # Strip newline and other trailing whitespace characters
            line = line.strip()
            if start_processing:
                if line:  # Check if the line is not empty
                    if (len(line) > 1 or line.lower() in ['i', 'a']) and line.isalpha():
                        words.append(line)
            elif line == '---':
                start_processing = True
    return words

def write_pd(dictionary: pd.DataFrame, path: str):
    with open(path, 'w', encoding='utf8') as file:
        file.writelines(['---\n'])
        for idx, item in dictionary[0].items():
            file.write(item)
            file.write("\n")

if __name__ == "__main__":
    dictionary = pd.DataFrame(load_dict(DICT_PATH))

    mask = (dictionary[0].str.len() <= 5)
    easy = dictionary.loc[mask].sample(frac=0.3)

    mask = (dictionary[0].str.len() <= 7)
    medium = dictionary.loc[mask].sample(frac=0.5)
    
    hard = dictionary.sample(frac=0.6)
    
    write_pd(easy, EASY_DICT_PATH)
    write_pd(medium, MED_DICT_PATH)
    write_pd(hard, HARD_DICT_PATH)