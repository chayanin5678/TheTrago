import { Platform, StyleSheet } from 'react-native';

const startingPointScreenStyles = StyleSheet.create({
  headerBg: {
    paddingTop: 0,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    minHeight: 160,
    justifyContent: 'flex-end',
    marginTop: Platform.OS === 'ios' ? -50 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: -24,
    marginTop: 0,
    height: 48,
    shadowColor: '#FD501E',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 48,
  },
  suggestionSection: {
    flex: 1,
    backgroundColor: '#F7F7FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -16,
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  suggestionLabel: {
    fontSize: 16,
    color: '#FD501E',
    fontWeight: 'bold',
    marginLeft: 28,
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#FD501E',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  suggestionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  suggestionSub: {
    fontSize: 13,
    color: '#B7B7B7',
    marginTop: 2,
  },
});

export default startingPointScreenStyles;
